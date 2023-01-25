import HTTPError from 'http-errors';

import { getData, setData, dataTYPE, GLOBAL_OWNER, removedUserTYPE } from './dataStore';
import { validateToken } from './tokens';
import { validateUser } from './auth';

// HTTP errors
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

/**
 * Given a user by their user ID, set their permissions to new permissions described by permissionId.
 *
 * ARGUMENTS:
 * @param {string} token of a registered user
 * @param {integer} uId of a user to be set
 * @param {integer} permissionId of the permission status
 *
 * RETURN VALUES:
 * @returns { {} } upon successful operation
 *
 * ERRORS:
 * @throws {403} if the authorised user is not a global owner
 * @throws {400} if uId does not refer to a valid user
 * @throws {400} uId refers to a user who is the only global owner and they are being demoted to a user
 * @throws {400} permissionId is invalid
 * @throws {400} the user already has the permissions level of permissionId
*/
function adminUserpermissionChangeV1 (token: string, uId: number, permissionId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // check whether the authorised user is a global owner or not
  const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
  if (authUserGlobalPermissions !== GLOBAL_OWNER) {
    throw HTTPError(FORBIDDEN, 'calling user is not permitted to change user permission');
  }

  // check whether and uId is valid or not
  if (validateUser(uId) === false) {
    throw HTTPError(BAD_REQUEST, 'invalid user id');
  }

  const globalOwner = Object.values(dataStore.users).filter(user => user.globalPermission === 1);
  // check whether uId refers to a user who is the only global owner and they are being demoted to a user
  if (globalOwner.length === 1 && permissionId === 2 && authUserId === uId) {
    throw HTTPError(BAD_REQUEST, 'user who is the only global owner, cannot be demoted to a user');
  }

  // check whetehr permissionId is invalid
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(BAD_REQUEST, 'permissionId is invalid');
  }

  // check whether the user already has the permissions level of permissionId
  for (const userEmail in dataStore.users) {
    if (dataStore.users[userEmail].uId === uId && dataStore.users[userEmail].globalPermission === permissionId) {
      throw HTTPError(BAD_REQUEST, 'the user already has the permissions level of permissionId');
    }
  }

  Object.values(dataStore.users).filter(user => user.uId === uId)[0].globalPermission = permissionId;
  setData(dataStore);
  return {};
}

/**
 * Given a user by their uId, remove them from the Treats.
 *
 * ARGUMENTS:
 * @param {string} token of a registered user
 * @param {integer} uId of a user to be removed
 *
 * RETURN VALUES:
 * @returns { {} } upon successful operation
 *
 * ERRORS:
 * @throws {403} if the authorised user is not a global owner
 * @throws {400} if uId does not refer to a valid user
 * @throws {400} uId refers to a user who is the only global owner
*/
function adminUserRemoveV1(token: string, uId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // check whether the authorised user is a global owner or not
  const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
  if (authUserGlobalPermissions !== GLOBAL_OWNER) {
    throw HTTPError(FORBIDDEN, 'calling user is not permitted to remove user');
  }

  // check whether uId is valid or not
  if (validateUser(uId) === false) {
    throw HTTPError(BAD_REQUEST, 'invalid user id');
  }

  const globalOwner = Object.values(dataStore.users).filter(user => user.globalPermission === GLOBAL_OWNER);
  // check whether uId refers to a user who is the only global owner
  if (globalOwner.length === 1 && authUserId === uId) {
    throw HTTPError(BAD_REQUEST, 'user who is the only global owner, cannot be removed');
  }

  // user profile remove first and last name + move to removedUsers array
  const email = Object.keys(dataStore.users).find(key => dataStore.users[key].uId === uId);
  dataStore.users[email].nameFirst = 'Removed';
  dataStore.users[email].nameLast = 'user';
  const removedUser: removedUserTYPE = {
    email: email,
    nameFirst: dataStore.users[email].nameFirst,
    nameLast: dataStore.users[email].nameLast,
    handleStr: dataStore.users[email].handleStr,
    password: dataStore.users[email].password,
    uId: dataStore.users[email].uId,
    globalPermission: dataStore.users[email].globalPermission,
    profileImgUrl: dataStore.users[email].profileImgUrl,
  };
  dataStore.removedUsers.push(removedUser);

  delete dataStore.users[email];

  // remove user from all dms
  for (const dm of dataStore.dms) {
    dm.members = dm.members.filter(id => id !== uId);
  }

  // remove user from all channels
  for (const channel of dataStore.channels) {
    channel.members = channel.members.filter(id => id !== uId);
    channel.owners = channel.owners.filter(id => id !== uId);
  }

  // remove message content of user
  const messages = dataStore.messages.filter(message => message.uId === uId);
  dataStore.messages = messages.map(messageObject => {
    messageObject.message = 'Removed user';
    return messageObject;
  });

  setData(dataStore);
  return {};
}

export { adminUserpermissionChangeV1, adminUserRemoveV1 };
