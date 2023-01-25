import uniquid from 'uniqid';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import crypto from 'crypto';

type token = string;

const FORBIDDEN = 403;

export const SECRET = 'sexy horses in your area';

/**
 * creates a hash for a given string
 *
 * ARGUMENTS:
 * @param { string } plainText that we want to hash
 *
 * RETURN VALUES:
 * @returns { string } hash generated from string
 */
function getHashOf(plainText: string): string {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

/**
 * adds a token to the dataStore with its corresponding user Id
 *
 * ARGUMENTS:
 * @param { number } uId user id that we want to generate a token for
 *
 * RETURN VALUES:
 * @returns { string } hash to return to user
 */
function addToken(uId: number): string {
  const dataStore = getData();

  const token = uniquid();

  const hash = getHashOf(token + SECRET);

  dataStore.tokens[token] = uId;

  setData(dataStore);

  return hash;
}

/**
 * removes a token from the dataStore
 *
 * ARGUMENTS:
 * @param {token} hash of token to remove from dataStore
 *
 * RETURN VALUES:
 * @returns { boolean } true = success, false = failure / error (e.g. if the token does not exist)
 */
function removeToken(hash: token): boolean {
  const dataStore = getData();

  const initialNumberOfTokens = Object.keys(dataStore.tokens).length;

  const matchingTokens = Object.keys(dataStore.tokens).filter(token => getHashOf(token + SECRET) === hash);

  matchingTokens.forEach(token => delete dataStore.tokens[token]);

  setData(dataStore);

  const finalNumberOfTokens = Object.keys(dataStore.tokens).length;

  if (initialNumberOfTokens - 1 === finalNumberOfTokens) {
    return true;
  }

  return false;
}

/**
 * deletes all tokens for a user, essentially logging them out everywhere
 *
 * ARGUMENTS:
 * @param {number} uId of user
 *
 * RETURN VALUES:
 * none
 *
 * ERRORS:
 * none
 */
function removeAllTokens(uId: number) {
  const dataStore = getData();

  const tokens = Object.keys(dataStore.tokens).filter(token => dataStore.tokens[token] === uId);
  tokens.forEach(token => delete dataStore.tokens[token]);

  setData(dataStore);
}

/**
 * checks if a token is valid
 *
 * ARGUMENTS:
 * @param {token} hash to validate
 *
 * RETURN VALUES:
 * @returns {number} authUserId of user with token
 *
 * ERRORS:
 * @throws {403} if token is invalid
 */
function validateToken(hash: token): number {
  const dataStore = getData();

  for (const token in dataStore.tokens) {
    if (getHashOf(token + SECRET) === hash) {
      return dataStore.tokens[token];
    }
  }

  throw HTTPError(FORBIDDEN, 'invalid token');
}

export { addToken, removeToken, validateToken, getHashOf, removeAllTokens };
