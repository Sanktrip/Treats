import validator from 'validator';
import HTTPError from 'http-errors';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';

import { url, port } from './config.json';

import { getData, setData } from './dataStore';
import { addToken, removeToken, getHashOf, removeAllTokens } from './tokens';

import { userTYPE, dataTYPE } from './dataStore';

import { updateUserlog, updateServerlog } from './log';

interface authUserId {
  authUserId: number,
  token: string
}

// HTTP errors
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

/**
 * given a user's email and password, logs the user in and returns the uId of the user
 *
 * ARGUMENTS:
 * @param {string} email of user logging in
 * @param {string} password of user logging in
 *
 * RETURN VALUES:
 * @returns { { authUserId: number } } if login successful (email exists and password is correct)
 *
 * ERRORS:
 * @throws {400} if user email doesn't exist
 * @throws {400} if password is incorrect
*/
function authLoginV1(email: string, password: string): authUserId {
  const dataStore = getData();

  if (!(email in dataStore.users)) {
    // return error if email does not exist within dataStore
    throw HTTPError(BAD_REQUEST, 'user email is not registered');
  } else if (dataStore.users[email].password !== getHashOf(password)) {
    // return error if the password to the corresponding email is incorrect
    throw HTTPError(BAD_REQUEST, 'incorrect password');
  }

  // generate token
  const newToken = addToken(dataStore.users[email].uId);

  // returns userId that corresponds to the inputs
  return {
    authUserId: dataStore.users[email].uId,
    token: newToken
  };
}

// authRegisterV1 boundaries
const PASSWORD_MIN_LENGTH = 6;
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 50;
const GLOBAL_PERMISSION_OWNER = 1;
const GLOBAL_PERMISSION_USER = 2;
const HANDLE_MAX_LENGTH = 20;
const DEFAULT_PROFILE_URL = `${url}:${port}/src/profileImgs/default.jpg`;

/**
 * given a user's details, registers the user to the app
 * and adds their details to the dataStore
 *
 * ARGUMENTS:
 * @param {string} email of user registering
 * @param {string} password of user registering
 * @param {string} nameFirst first name of user registering
 * @param {string} nameLast last name of user registering
 *
 * RETURN VALUES:
 * @returns { {authUserId: number} } an object containing the uId of the created user
 *
 * ERRORS:
 * @throws {400} if email is invalid
 * @throws {400} if password length < 6 characters
 * @throws {400} is first or last name is not 1-50 characters
 * @throws {400} if email already exists
 */
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): authUserId {
  // return error if email invalid
  if (!(validator.isEmail(email))) {
    throw HTTPError(BAD_REQUEST, 'invalid email');
  }

  // return error if password invalid
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw HTTPError(BAD_REQUEST, 'password must be >6 characters');
  }

  // return error if nameFirst is too long or short
  if (nameFirst.length < NAME_MIN_LENGTH || nameFirst.length > NAME_MAX_LENGTH) {
    throw HTTPError(BAD_REQUEST, 'first name must be 1-50 characters');
  }

  // return error if nameLast is too long or short
  if (nameLast.length < NAME_MIN_LENGTH || nameLast.length > NAME_MAX_LENGTH) {
    throw HTTPError(BAD_REQUEST, 'last name must be 1-50 characters');
  }

  const dataStore: dataTYPE = getData();

  // return error if email already taken
  if (email in dataStore.users) {
    throw HTTPError(BAD_REQUEST, 'email already registered');
  }

  // generate unique uId for new user
  const newId: number = generateUID();

  // if user is first, make their permission "owner", else set it to "member"
  let newGlobalPermission: number = GLOBAL_PERMISSION_USER;
  if (Object.keys(dataStore.users).length === 0) {
    newGlobalPermission = GLOBAL_PERMISSION_OWNER;
  }

  // generate a new, unique handleStr from the user's first and last name
  const newHandleStr = generateHandleStr(nameFirst, nameLast);

  dataStore.users[email] = {
    uId: newId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: newHandleStr,
    password: getHashOf(password),
    globalPermission: newGlobalPermission,
    profileImgUrl: DEFAULT_PROFILE_URL,
  };

  // initialise a notifications array for each user in the dataStore
  dataStore.notifications[newId] = [];

  setData(dataStore);

  // generate new token
  const newToken = addToken(newId);

  updateUserlog('n', 'n', newId);
  updateServerlog('n');

  return {
    authUserId: newId,
    token: newToken
  };
}

/**
 * logs a user out by deleting their token
 *
 * ARGUMENTS:
 * @param {string} token of user to logout
 *
 * RETURN VALUES:
 * @returns { {} } empty object, if successfully deletes token from dataStore
 *
 * ERRORS:
 * @throws {403} if invalid token is given
 */
function authLogoutV1(token: string): Record<string, never> {
  if (removeToken(token) === false) {
    throw HTTPError(FORBIDDEN, 'invalid token');
  }

  return {};
}

/**
 * Given an email address, if the email address belongs to a registered user, send them an email containing a secret password reset code.
 *
 * ARGUMENTS:
 * @param {string} email of user
 *
 * RETURN VALUES:
 * @returns { {} } empty object
 */
function authPasswordResetRequestV1(email: string):Record<string, never> {
  const dataStore = getData();

  // if user doesn't exist, return and do nothing
  if (!(email in dataStore.users)) {
    return {};
  }

  // send email to user with password reset code
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'dangelo.moen@ethereal.email',
      pass: 'UXtMmVd4rSsHem7MCW'
    }
  });

  const resetCode = randomstring.generate();

  transporter.sendMail({
    from: 'dangelo.moen@ethereal.email',
    to: email,
    subject: 'Reset Password',
    text: `secret reset code: ${resetCode}`,
  });

  dataStore.resetCode[email] = resetCode;

  setData(dataStore);

  // log user out of all current sessions
  const authUserId = dataStore.users[email].uId;
  removeAllTokens(authUserId);

  return {};
}

/**
 * Given a reset code for a user, set that user's new password to the password provided. Once a reset code has been used, it is then invalidated.
 *
 * ARGUMENTS:
 * @param {string} resetCode received from user's email
 * @param {string} newPassword of user
 *
 * RETURN VALUES:
 * @returns { {} } empty object
 *
 * ERRORS
 * @throws {400} if resetCode is not a valid reset code
 *               or password entered is less than 6 characters long
 *
 */
function authPasswordresetResetV1(resetCode: string, newPassword:string):Record<string, never> {
  const dataStore = getData();
  for (const email in dataStore.resetCode) {
    if (dataStore.resetCode[email] === resetCode) {
      if (newPassword.length < PASSWORD_MIN_LENGTH) {
        throw HTTPError(BAD_REQUEST, 'password must be >6 characters');
      } else {
        dataStore.users[email].password = getHashOf(newPassword);
        setData(dataStore);
        return {};
      }
    }
  }
  throw HTTPError(BAD_REQUEST, 'resetCode is invalid');
}

// ----- HELPER FUNCTIONS ----- //
/**
 * given a userId, checks if the user exists in the dataStore
 *
 * ARUGMENTS:
 * @param {number} userId of user that we are validating
 *
 * RETURN VALUES:
 * @returns {boolean} true or false depending on whether the user exists
 */
function validateUser(userId: number): boolean {
  const dataStore = getData();
  const arr: userTYPE[] = Object.values(dataStore.users);
  const valid = arr.filter((value) => value.uId === userId);
  if (valid.length === 0) {
    return false;
  }
  return true;
}

/**
 * generates a unique user id
 *
 * ARGUMENTS:
 * takes no parameters
 *
 * RETURN VALUE:
 * @returns {number} unique user id that does not yet exist in the dataStore
 */
function generateUID(): number {
  const dataStore = getData();

  // get an array of all user ids
  const userIds = Object.values(dataStore.users).map((user) => user.uId);
  const removedUserIds = dataStore.removedUsers.map(user => user.uId);
  const allUserIds = userIds.concat(removedUserIds);

  if (allUserIds.length === 0) {
    // if no users exist, return 1 (which is a new id)
    return 1;
  }

  // if other users exist, return the highest Id so far plus one
  return Math.max(...allUserIds) + 1;
}

/**
 * generates a unique handleStr for a user based on their first and last name
 *
 * ARGUMENTS:
 * @param {string} nameFirst first name of user
 * @param {string} nameLast last name of user
 *
 * RETURN VALUES:
 * @returns {string} generated handle string
 *
 * ERRORS
 * @throws {400} if the first and last name are both only illegal (non-alpha-numeric) characters
 */
function generateHandleStr(nameFirst: string, nameLast: string): string {
  const dataStore: dataTYPE = getData();

  // handle string is lower case first name + last name; then remove non-alpha numeric characters
  let handleStr: string = (nameFirst.toLowerCase() + nameLast.toLowerCase()).replace(/[^a-z0-9]/gi, '');

  // i.e. if nameFirst and nameLast were all special characters
  if (handleStr.length === 0) {
    throw HTTPError(BAD_REQUEST, 'no alphanumeric characters in first or last name');
  }

  // if handleStr is > 20 characters, truncate it
  if (handleStr.length > HANDLE_MAX_LENGTH) {
    handleStr = handleStr.substring(0, HANDLE_MAX_LENGTH);
  }

  // if handleStr already exists, keep adding numbers till it is unique
  let handleUnique = false;
  let handleNumber = 0; // number to append to handleStr
  let handleStrTry: string = handleStr;
  while (handleUnique === false) {
    handleUnique = true;
    for (const userEmail in dataStore.users) {
      if (dataStore.users[userEmail].handleStr === handleStrTry) {
        handleStrTry = handleStr + handleNumber;
        handleNumber++;
        handleUnique = false;
      }
    }
  }

  return handleStrTry;
}

export { authLoginV1, authRegisterV1, authLogoutV1, validateUser, authPasswordResetRequestV1, authPasswordresetResetV1 };
