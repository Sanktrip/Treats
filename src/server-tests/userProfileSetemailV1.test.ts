import { POST, PUT, GET, DELETE, BODY } from './httpRequestsV1';
import { authRegisterPATH, userProfilePATH, userProfileSetemailPATH, clearPATH } from './httpRequestsV1';

// STANDARD INPUTS
const EMAIL_VALID = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_2 = 'hayden.smith@unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';

const EMAIL_INVALID = 'lol-invalid-email';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing valid functionality', () => {
  test('correct return type', () => {
    // register user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // check return type of SetEmail
    const setRes = PUT(userProfileSetemailPATH, {
      token: BODY(registerRes).token,
      email: EMAIL_VALID_2
    });
    expect(setRes.statusCode).toBe(OK);
    expect(BODY(setRes)).toStrictEqual({});
  });

  test('correctly updates dataStore', () => {
    // register a user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // check the user's email
    const profileRes1 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes1.statusCode).toBe(OK);
    expect(BODY(profileRes1).user.email).toBe(EMAIL_VALID);

    // change the user's email
    const setRes = PUT(userProfileSetemailPATH, {
      token: BODY(registerRes).token,
      email: EMAIL_VALID_2
    });
    expect(setRes.statusCode).toBe(OK);
    expect(BODY(setRes)).toStrictEqual({});

    // check that the user's email has been updated
    const profileRes2 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes2.statusCode).toBe(OK);
    expect(BODY(profileRes2).user.email).toBe(EMAIL_VALID_2);
  });

  test('return no error if email is set to currently existing email', () => {
    // register a user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // change the user's email
    const setRes = PUT(userProfileSetemailPATH, {
      token: BODY(registerRes).token,
      email: EMAIL_VALID
    });
    expect(setRes.statusCode).toBe(OK);
    expect(BODY(setRes)).toStrictEqual({});

    // check the user's email
    const profileRes1 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes1.statusCode).toBe(OK);
    expect(BODY(profileRes1).user.email).toBe(EMAIL_VALID);
  });
});

describe('error handling', () => {
  test('error upon invalid token', () => {
    // register new user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // call userProfileSetemail with invalid token
    const TOKEN_INVALID = BODY(registerRes).token + '0';

    const setRes = PUT(userProfileSetemailPATH, {
      token: TOKEN_INVALID,
      email: EMAIL_VALID_2
    });
    expect(setRes.statusCode).toBe(FORBIDDEN);

    // check that user's email has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.email).toBe(EMAIL_VALID);
  });

  test('error upon invalid email', () => {
    // register a user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // call userProfileSetemail with invalid email
    const setRes = PUT(userProfileSetemailPATH, {
      token: BODY(registerRes).token,
      email: EMAIL_INVALID
    });
    expect(setRes.statusCode).toBe(BAD_REQUEST);

    // check that user's email has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.email).toBe(EMAIL_VALID);
  });

  test('error upon email already used', () => {
    // register two users
    const registerRes1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes1.statusCode).toBe(OK);

    const registerRes2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes2.statusCode).toBe(OK);

    // try to update user1's email to user2's email
    const setRes = PUT(userProfileSetemailPATH, {
      token: BODY(registerRes1).token,
      email: EMAIL_VALID_2
    });
    expect(setRes.statusCode).toBe(BAD_REQUEST);

    // check that user1's email has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes1).token,
      uId: BODY(registerRes1).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.email).toBe(EMAIL_VALID);
  });
});
