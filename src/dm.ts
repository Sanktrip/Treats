import HTTPError from 'http-errors';

import {
  getData, setData,
  userTYPE, dataTYPE, dmTYPE
} from './dataStore';
import { validateUser } from './auth';
import { userProfile, userProfileV2 } from './users';
import { validateToken } from './tokens';
import { notifyDmInvited } from './notifications';
import { updateUserlog, updateServerlog } from './log';

interface listDms {
  dmId: number,
  name: string
}
interface dmDetailsTYPE {
  name: string,
  members: userProfile[]
}

const FORBIDDEN = 403;
const BAD_REQUEST = 400;

/**
 * given the users Id and the dm recepients Id, a dm is created
 *
 * ARGUMENTS:
 * @param {string} token of user creating the dm
 * @param {number[]} uIds of the recepient users
 *
 * RETURN VALUES:
 * @returns { { dmId: number } } if dm creation is successful (all ids are valid and there are no duplicates)
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if any uId in uIds is invalid
 * @throws {400} there are duplicated Ids
 */
function dmCreateV1(token: string, uIds: number[]): {dmId: number} {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();
  if (uIds.length === 0) {
    throw HTTPError(BAD_REQUEST, 'no uIds passed in');
  }
  uIds.push(authUserId);
  // checks for duplicate uIds
  const duplicate = uIds.filter((uId, index) => uIds.indexOf(uId) !== index);
  if (duplicate.length !== 0) {
    throw HTTPError(BAD_REQUEST, 'duplicate uIds passed in');
  }
  const numOfUsers = uIds.length;
  // check if the uIds are valid
  const validUsers = uIds.filter(i => validateUser(i) === true);
  if (validUsers.length !== numOfUsers) {
    throw HTTPError(BAD_REQUEST, 'invalid uIds passed in');
  }

  const dmId = generateDmId();
  const newDm: dmTYPE = {
    dmId: dmId,
    name: formatDmName(uIds),
    owner: authUserId,
    members: uIds,
    messages: [],
  };

  dataStore.dms.push(newDm);
  setData(dataStore);

  notifyDmInvited(token, uIds, dmId, formatDmName(uIds));

  updateServerlog('d');
  // updateUserlog('d', token);
  for (const i of uIds) {
    updateUserlog('d', 'null', i);
  }

  return { dmId: dmId };
}

/**
 * given the users Id, returns a list of dms they are members of
 *
 * ARGUMENTS:
 * @param {string} token of user creating the dm
 *
 * RETURN VALUES:
 * @returns { dms: { dmId: number, name: string }[] }
 *
 * ERRORS:
 * @throws {403} if token invalid
 */
function dmListV1(token: string): {dms: listDms[]} {
  const authUserId = validateToken(token);

  const dataStore = getData();

  const list = dataStore.dms.filter(i => i.members.includes(authUserId));
  const listOfDms: listDms[] = list.map(i => { return { dmId: i.dmId, name: i.name }; });
  return { dms: listOfDms };
}

/**
 * given a user that is part of a dm, returns information about the dm
 *
 * ARGUMENTS:
 * @param {string} token of the user calling the function
 * @param {number} dmId of the dm that the user wants information about
 *
 * RETURN VALUES:
 * @returns {dmDetailsTYPE} details about the dm if no errors
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if invalid dmId
 * @throws {403} if user is not part of dm
 */
function dmDetailsV1(token: string, dmId: number): dmDetailsTYPE {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  const dms = dataStore.dms.filter((dm) => dm.dmId === dmId);

  // if no dm exists
  if (dms.length < 1) {
    throw HTTPError(BAD_REQUEST, 'invalid dm id');
  }

  const dm = dms[0];

  // if caller is not a member of the dm, return ERROR
  if (!(dm.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'auth user is not a dm member');
  }

  return {
    name: dm.name,
    members: dm.members.map((uId) => (userProfileV2(token, uId) as {user: userProfile}).user),
  };
}

/**
 * Given a DM ID, the user is removed as a member of this DM.
 *
 * ARGUMENTS:
 * @param {string} token of the user calling the function
 * @param {number} dmId of the dm that the user wants to leave
 *
 * RETURN VALUES:
 * @returns {{}} if successful leave the DM
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if invalid dm id
 * @throws {403} if user is not member of dm
 */
function dmLeaveV1(token: string, dmId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // if dmId is invalid
  if (!(dataStore.dms.some((dm) => dm.dmId === dmId))) {
    throw HTTPError(BAD_REQUEST, 'invalid dm id');
  }

  const dm = dataStore.dms.filter(dm => dm.dmId === dmId)[0];

  // check whether authorised user is a member
  if (!(dm.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'auth user is not a dm member');
  }

  dm.members = dm.members.filter(id => id !== authUserId);

  setData(dataStore);

  updateUserlog('d', token);

  return {};
}

/**
 * lets a dm's owner delete a dm
 *
 * ARGUMENTS:
 * @param {string} token uId of user calling dmRemove
 * @param {number} dmId id of the dm to remove
 *
 * RETURNS:
 * @returns {{}} if successfully removes dm
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if invalid dm id
 * @throws {403} if auth user is not DM creater
 * @throws {403} if auth user is not longer in dm
 */
function dmRemoveV1(token: string, dmId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  const dms = dataStore.dms.filter(dm => dm.dmId === dmId);

  // no dm with matching dmId found
  if (dms.length !== 1) {
    throw HTTPError(BAD_REQUEST, 'invalid dm id');
  }

  const dm = dms[0];

  // authUserId is not original DM creator
  if (dm.owner !== authUserId) {
    throw HTTPError(FORBIDDEN, 'auth user not original dm creator');
  }

  // authUserId has left dm
  if (!(dm.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'auth user not a dm member any longer');
  }

  const ogMembers = [...dm.members];

  // remove all members
  dm.members = [];
  // delete dm from dataStore
  dataStore.dms = dataStore.dms.filter(dm => dm.dmId !== dmId);

  setData(dataStore);

  updateServerlog('d');
  updateServerlog('m');
  // updateUserlog('d', token);
  for (const i of ogMembers) {
    updateUserlog('d', 'null', i);
  }

  return {};
}

/**
 * Generates a dmId for dmCreateV1
 *
 * ARGUMENTS:
 * no parameters
 *
 * RETURN VALUES:
 * @returns { number } Returns 1 if the dms array is empty, otherwise it returns the highest current dmId + 1
*/
function generateDmId(): number {
  const dataStore = getData();

  // get array of all dm ids
  const dmIds: number[] = dataStore.dms.map((dm) => dm.dmId);

  if (dmIds.length === 0) {
    // if no dm exist, return 1 (which is a new id)
    return 1;
  }

  // if other dms exist, return the highest Id so far plus one
  return Math.max(...dmIds) + 1;
}

/**
 * given an array of uIds that are in a dm, return the formatted dm name
 *
 * ARGUMENTS:
 * @param {number[]} members an array of uId of the members of the dm
 *
 * RETURN VALUES:
 * @returns {string} the formatted dm name
 */
function formatDmName(members: number[]): string {
  const dataStore: dataTYPE = getData();

  const allUsers: userTYPE[] = Object.values(dataStore.users);

  const users = allUsers.filter(i => members.includes(i.uId));

  const userHandles = users.map(i => i.handleStr);

  // sorting the user handles in alphabetical order
  userHandles.sort((a, b) => {
    const difference = a.localeCompare(b);
    return difference;
  });

  return userHandles.join(', ');
}

/**
 * checks if a given dm id is valid
 *
 * ARGUMENTS:
 * @param {number} dmId dm id we wish to validate
 *
 * RETURN VALUES:
 * @returns {dmTYPE} dm structure from dataStore
 *
 * ERRORS:
 * @throws {400} if dmId invalid
 */
function validateDm(dmId: number): dmTYPE {
  const dataStore: dataTYPE = getData();

  const dms = dataStore.dms.filter((dm) => dm.dmId === dmId);
  // if no dm exists
  if (dms.length < 1) {
    throw HTTPError(BAD_REQUEST, 'invalid dm id');
  }

  return dms[0];
}

export { dmCreateV1, dmListV1, dmDetailsV1, dmLeaveV1, dmRemoveV1, validateDm };
