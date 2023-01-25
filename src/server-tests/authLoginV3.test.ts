// @ts-nocheck

import { expect } from '@jest/globals';

import { POST, BODY, DELETE } from './httpRequestsV1';
import { authRegisterPATH, authLoginPATH, clearPATH } from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;

// STANDARD INPUTS
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'haha@gmail.com';
const EMAIL_VALID_3 = 'fluffy.unicorns@mailinator.com';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const EMAIL_WRONG = 'josh.lim@student.unsw.edu.au';
const PASSWORD_WRONG = 'apple123';

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

// test whether auth/login/v2 returns correct output
describe('authLoginV3 tests with valid inputs', () => {
  test('correct return value - one user', () => {
    // register user
    const register = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    // login user
    const login = POST(authLoginPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID
    });

    // check that correct authUserId is given, and token is unique
    expect(BODY(login)).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
    expect(login.statusCode).toBe(OK);
    expect(BODY(register).authUserId).toBe(BODY(login).authUserId);
    expect(BODY(register).token).not.toBe(BODY(login).token);
  });

  test('correct return value - three users', () => {
    // register 3 users
    const register1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const register2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const register3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    // login user 3 (user with email EMAIL_VALID_3)
    const login3 = POST(authLoginPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID
    });
    expect(BODY(login3)).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
    expect(login3.statusCode).toBe(OK);
    expect(BODY(register3).authUserId).toBe(BODY(login3).authUserId);
    expect(BODY(register3).token).not.toBe(BODY(login3).token);

    // login user 2 (user with email EMAIL_VALID_2)
    const login2 = POST(authLoginPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID
    });
    expect(BODY(login2)).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
    expect(login2.statusCode).toBe(OK);
    expect(BODY(register2).authUserId).toBe(BODY(login2).authUserId);
    expect(BODY(register2).token).not.toBe(BODY(login2).token);
  });
});

// test whether auth/login/v2 returns BAD_REQUEST 400 in correct situations
describe.each([
  ['invalid password', EMAIL_VALID, PASSWORD_WRONG],
  ['invalid email', EMAIL_WRONG, PASSWORD_VALID],
  ['invalid email and password', EMAIL_WRONG, PASSWORD_WRONG],
])('authLoginV2 error handling', (error, errorEmail, errorPassword) => {
  test(`error when given ${error}`, () => {
    // register a user
    const register = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    // check that the register works
    expect(BODY(register)).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
    expect(register.statusCode).toBe(OK);

    // login a user
    const login = POST(authLoginPATH, {
      email: errorEmail,
      password: errorPassword
    });

    expect(login.statusCode).toBe(BAD_REQUEST);
  });
});

describe('authLoginV3 error handling', () => {
  test('error following invalid registration', () => {
    // try (but fail) to invalidly register a new user
    const register = POST(authRegisterPATH, {
      email: 'sank',
      password: 'p',
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(register.statusCode).toBe(BAD_REQUEST);

    // try to login invalidly registered user
    const login = POST(authLoginPATH, {
      email: 'sank',
      password: 'p',
    });
    expect(login.statusCode).toBe(BAD_REQUEST);
  });

  test('error when no registered users', () => {
    // do not register users, jut try to log in with random valid details
    const login = POST(authLoginPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    });
    expect(login.statusCode).toBe(BAD_REQUEST);
  });
});
