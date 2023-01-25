import HTTPError from 'http-errors';

import validator from 'validator';

import { getData, setData } from './dataStore';
import { dataTYPE } from './dataStore';
import { validateToken } from './tokens';
import { getUserStats, getUsersStats } from './log';

export interface userProfile {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string,
}

const BAD_REQUEST = 400;

/**
 * given an authorised user id and specified user id,
 * returns data related to user id
 *
 * ARGUMENTS:
 * @param {string} token of user requesting information
 * @param {integer} userId is Id of user with information needing to be returned
 *
 * RETURN VALUES:
 * @returns { { user: userProfile } } object containing all information related to userId, given a valid uId
 *
 * ERRORS:
 * @throws {403} if invalid token passed in
 * @throws {400} if invalid uId passed in
 */
function userProfileV2(token: string, userId: number): { user: userProfile } {
  validateToken(token);

  const dataStore: dataTYPE = getData();

  // check if user is removed user
  const matchingRemovedUsers = dataStore.removedUsers.filter(removedUser => removedUser.uId === userId);
  // console.log(matchingRemovedUsers);
  if (matchingRemovedUsers.length === 1) {
    const matchingRemovedUser = matchingRemovedUsers[0];
    return {
      user: {
        uId: matchingRemovedUser.uId,
        email: matchingRemovedUser.email,
        nameFirst: matchingRemovedUser.nameFirst,
        nameLast: matchingRemovedUser.nameLast,
        handleStr: matchingRemovedUser.handleStr,
        profileImgUrl: matchingRemovedUser.profileImgUrl,
      }
    };
  }

  const usersEmail: string[] = Object.keys(dataStore.users);
  const matchingUsersEmail = usersEmail.filter((email) => dataStore.users[email].uId === userId);

  if (matchingUsersEmail.length === 0) {
    // user does not exist
    throw HTTPError(BAD_REQUEST, 'user id does not exist');
  }

  const userEmail = matchingUsersEmail[0];

  return {
    user: {
      uId: dataStore.users[userEmail].uId,
      email: userEmail,
      nameFirst: dataStore.users[userEmail].nameFirst,
      nameLast: dataStore.users[userEmail].nameLast,
      handleStr: dataStore.users[userEmail].handleStr,
      profileImgUrl: dataStore.users[userEmail].profileImgUrl,
    }
  };
}

/**
 * returns a list of all users and their details, given a valid token
 *
 * ARGUMENTS:
 * @param {string} token of user requesting all user details
 *
 * RETURN VALUES:
 * @returns {users: userProfile[]} array of all users
 *
 * ERRORS:
 * @throws {403} if invalid token passed in
 */
function usersAllV1(token: string): { users: userProfile[] } {
  validateToken(token);

  const dataStore = getData();
  const uIds = Object.values(dataStore.users).map((user) => user.uId);

  return {
    users: uIds.map((uId) => (userProfileV2(token, uId) as {user: userProfile}).user)
  };
}

/**
 * allows the user to change their email
 *
 * ARGUMENTS:
 * @param {string} token of the user requesting the email change
 * @param {string} email the new email that the user wants to change to
 *
 * RETURN VALUES:
 * @returns { {} } if successfully changes the email
 *
 * ERRORS:
 * @throws {403} if invalid token given
 * @throws {400} if invalid email passed in
 * @throws {400} if email already taken
 */
function userProfileSetemailV1(token: string, email: string): Record<string, never> {
  const authUserId = validateToken(token);

  // return error if email invalid
  if (!(validator.isEmail(email))) {
    throw HTTPError(BAD_REQUEST, 'invalid email entered');
  }

  const dataStore: dataTYPE = getData();

  // return error if email already taken
  if (email in dataStore.users) {
    if (dataStore.users[email].uId === authUserId) {
      return {};
    } else {
      throw HTTPError(BAD_REQUEST, 'email already taken');
    }
  }

  const oldEmail = Object.keys(dataStore.users).find(key => dataStore.users[key].uId === authUserId);

  dataStore.users[email] = dataStore.users[oldEmail];

  delete dataStore.users[oldEmail];

  setData(dataStore);

  return {};
}

/**
 * updates a user's handleStr to the new handleStr
 *
 * ARGUMENTS:
 * @param {string} token of user who wants to update their handleStr
 * @param {string} handleStr new handle string to update it to
 *
 * RETURN VALUES:
 * @returns { {} } if successfully updates
 *
 * ERRORS:
 * @throws {403} if invalid token given
 * @throws {400} if handleStr too long, too short
 * @throws {400} if handleStr contains illegal characters
 * @throws {400} if handleStr already used
 */
function userProfileSethandleV1(token: string, handleStr: string): Record<string, never> {
  const authUserId = validateToken(token);

  // if handleStr is wrong length, return ERROR
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(BAD_REQUEST, 'handle string is invalid length');
  }

  // if there are non-alpha-numeric characters present, return ERROR
  if (handleStr.replace(/[^a-z0-9]/gi, '') !== handleStr) {
    throw HTTPError(BAD_REQUEST, 'invalid handle string');
  }

  const dataStore: dataTYPE = getData();

  // if handleStr already used, return ERROR
  const matchingHandles = Object.values(dataStore.users).filter((user) => user.handleStr === handleStr);

  if (matchingHandles.length > 0) {
    if (matchingHandles[0].uId === authUserId) {
      return {};
    }

    throw HTTPError(BAD_REQUEST, 'handle string already taken by another user');
  }

  // update user handleStr
  const email = Object.keys(dataStore.users).find(key => dataStore.users[key].uId === authUserId);
  dataStore.users[email].handleStr = handleStr;

  setData(dataStore);

  return {};
}

/**
 * updates a user's first and last name to the new first and last name given
 *
 * ARGUMENTS:
 * @param {string} token uId of user who wants to update their name
 * @param {string} nameFirst new first name of user to update to
 * @param {string} nameLast new last name of user to update to
 *
 * RETURN VALUES:
 * @returns { {} } if successfully updates name
 *
 * ERRORS:
 * @throws {403} if invalid token given
 * @throws {400} if first / last name not 1-50 characters
 */
function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string): Record<string, never> {
  const authUserId = validateToken(token);

  // return error if names are invalid length
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(BAD_REQUEST, 'invalid first name length');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(BAD_REQUEST, 'invalid last name length');
  }

  // update user name
  const dataStore = getData();

  const email = Object.keys(dataStore.users).find(key => dataStore.users[key].uId === authUserId);
  dataStore.users[email].nameFirst = nameFirst;
  dataStore.users[email].nameLast = nameLast;

  setData(dataStore);

  return {};
}

/**
 * returns stats for the current user
 *
 * ARGUMENTS
 * @param {string} token uId of user that function is getting stats for
 *
 * RETURN VALUES:
 * @returns { { userStats } }
 *
 * ERRORS:
 * none
*/
function userStatsV1(token: string) {
  const uId = validateToken(token);
  return getUserStats(uId);
}

/**
 * returns stats for the whole server
 *
 * ARGUMENTS:
 * @param {string} token of user who is calling the function
 *
 * RETURN VALUES:
 * @returns { { workspaceStats } }
 *
 * ERRORS:
 * none
*/
function usersStatsV1(token: string) {
  validateToken(token);
  return getUsersStats();
}

export { userProfileV2, usersAllV1, userProfileSetemailV1, userProfileSethandleV1, userProfileSetnameV1, userStatsV1, usersStatsV1 };
