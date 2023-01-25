// @ts-nocheck

import { expect } from '@jest/globals';

import { GET, DELETE, POST, BODY } from './httpRequestsV1';
import { authRegisterPATH, clearPATH, userProfilePATH } from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;

// STANDARD INPUTS
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_3 = 'fluffy.unicorns@mailinator.com';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const HANDLE_VALID = 'haydensmith';

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

// testing if auth/register/v1 functions properly given valid input
describe('authRegisterV1 test return value', () => {
  test('correctly updates dataStore', () => {
    // register a user
    const result = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(result.statusCode).toBe(OK);

    // use user/profile/v2 to check if the data has been stored successfully
    const userData = GET(userProfilePATH, {
      token: BODY(result).token,
      uId: BODY(result).authUserId
    });
    expect(userData.statusCode).toBe(OK);

    expect(BODY(userData)).toStrictEqual({
      user: {
        uId: BODY(result).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      }
    });
  });

  // generates unique uId and token for two users
  test('generates unique uId + token for second user', () => {
    // register 2 users
    const result1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const result2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: 'i_like_unicorns_1',
      nameFirst: 'Josh',
      nameLast: 'Lim'
    });
    expect(result1.statusCode).toBe(OK);
    expect(result2.statusCode).toBe(OK);

    // ensure that the uIds and tokens generated for each user are not equal
    expect(BODY(result1).authUserId).toBeDefined();
    expect(BODY(result1).token).toBeDefined();
    expect(BODY(result2).authUserId).toBeDefined();
    expect(BODY(result2).token).toBeDefined();

    expect(BODY(result1).authUserId).not.toEqual(BODY(result2).authUserId);
    expect(BODY(result1).token).not.toEqual(BODY(result2).token);
  });

  // correctly handles case with duplicate handles for three users
  test('generates unique handleStr for second and third user', () => {
    // register 3 users with the same first/last names
    const result1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const result2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: 'i_like_unicorns_1',
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const result3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: 'i_like_unicorns_1',
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(result1.statusCode).toBe(OK);
    expect(result2.statusCode).toBe(OK);
    expect(result3.statusCode).toBe(OK);

    // using user/profile/v2, get info on 3 users
    const userData1 = GET(userProfilePATH, {
      token: BODY(result1).token,
      uId: BODY(result1).authUserId
    });
    const userData2 = GET(userProfilePATH, {
      token: BODY(result2).token,
      uId: BODY(result2).authUserId
    });
    const userData3 = GET(userProfilePATH, {
      token: BODY(result3).token,
      uId: BODY(result3).authUserId
    });
    expect(userData1.statusCode).toBe(OK);
    expect(userData2.statusCode).toBe(OK);
    expect(userData3.statusCode).toBe(OK);

    // using user/profile/v2, check if the generated handleStr are correct
    const userHandle1 = BODY(userData1).user.handleStr;
    const userHandle2 = BODY(userData2).user.handleStr;
    const userHandle3 = BODY(userData3).user.handleStr;

    expect(userHandle1).toBeDefined();
    expect(userHandle2).toBeDefined();
    expect(userHandle3).toBeDefined();

    expect(userHandle1).not.toEqual(userHandle2);
    expect(userHandle1).not.toEqual(userHandle3);
    expect(userHandle2).not.toEqual(userHandle3);

    expect(userHandle1).toStrictEqual(HANDLE_VALID);
    expect(userHandle2).toStrictEqual(userHandle1 + '0');
    expect(userHandle3).toStrictEqual(userHandle1 + '1');
  });

  // correctly generates handleStr without non-alphanumeric characters
  test('generates lowercase handleStr without non-alphanumeric characters', () => {
    // register user with non-alphanumeric characters in their names
    const result = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: '.1?!Hay^* dEn0',
      nameLast: '-~00S+m./1th*(-}'
    });
    expect(result.statusCode).toBe(OK);

    // get user's data and check if handleStr are generated correctly
    const userData = GET(userProfilePATH, {
      token: BODY(result).token,
      uId: BODY(result).authUserId
    });
    expect(userData.statusCode).toBe(OK);

    const userHandle = BODY(userData).user.handleStr;

    expect(userHandle).toBeDefined();
    expect(userHandle).toStrictEqual('1hayden000sm1th');
  });

  // correctly generates handleStr of correct length ( <= 20 )
  test('generates handleStr of correct length ( <= 20 )', () => {
    const result = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: 'H.A.Y.D.E.N.Hayden',
      nameLast: 'smith.S.M.I.T.H'
    });
    expect(result.statusCode).toBe(OK);

    const userData = GET(userProfilePATH, {
      token: BODY(result).token,
      uId: BODY(result).authUserId
    });
    expect(userData.statusCode).toBe(OK);

    const userHandle = BODY(userData).user.handleStr;

    expect(userHandle).toBeDefined();

    expect(userHandle.length).toBeLessThanOrEqual(20);
    expect(userHandle).toStrictEqual('haydenhaydensmithsmi');
  });

  // correctly transforms duplicate handleStr that is too long
  test('correctly transforms duplicate handleStr that is too long', () => {
    const result1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: 'H.A.Y.D.E.N.Hayden',
      nameLast: 'smith.S.M.I.T.H'
    });
    expect(result1.statusCode).toBe(OK);
    const result2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: 'H.A.Y.%D.E.N.Hayden',
      nameLast: 'smith.S.M.I.T.H'
    });
    expect(result2.statusCode).toBe(OK);

    const userData = GET(userProfilePATH, {
      token: BODY(result2).token,
      uId: BODY(result2).authUserId
    });

    const userHandle = BODY(userData).user.handleStr;

    expect(userHandle).toBeDefined();
    expect(userHandle).toStrictEqual('haydenhaydensmithsmi0');
  });
});

// testing if auth/register/v2 returns errors where needed
describe.each([
  ['invalid email', 'abc123@unsw', PASSWORD_VALID, FIRSTNAME_VALID, LASTNAME_VALID],
  ['password length < 6', EMAIL_VALID, 'abc', FIRSTNAME_VALID, LASTNAME_VALID],
  ['firstName length < 1', EMAIL_VALID, PASSWORD_VALID, '', LASTNAME_VALID],
  ['firstName length > 50', EMAIL_VALID, PASSWORD_VALID, 'HaydenHaydenHaydenHaydenHaydenHaydenHaydenHaydenHayden', LASTNAME_VALID],
  ['lastName length < 1', EMAIL_VALID, PASSWORD_VALID, FIRSTNAME_VALID, ''],
  ['lastName length > 50', EMAIL_VALID, PASSWORD_VALID, FIRSTNAME_VALID, 'SmithSmithSmithSmithSmithSmithSmithSmithSmithSmithSmith'],
  ['first and last name all special characters', EMAIL_VALID, PASSWORD_VALID, '.,/;[][][][]```--===-', './.-=`/[]][;]'],
])('authRegisterV1 error handling', (error, email, password, firstName, lastName) => {
  test(`returns error upon ${error}`, () => {
    const result = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: firstName,
      nameLast: lastName
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });
});

describe('authRegisterV1 error handling', () => {
  test('returns error upon taken email', () => {
    const result1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const result2 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: 'imposter',
      nameFirst: 'Among',
      nameLast: 'Us'
    });
    expect(result1.statusCode).toBe(OK);
    expect(result2.statusCode).toBe(BAD_REQUEST);
  });
});
