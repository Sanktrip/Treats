import { POST, PUT, GET, DELETE, BODY } from './httpRequestsV1';
import { authRegisterPATH, userProfilePATH, userProfileSethandlePATH, clearPATH } from './httpRequestsV1';

// STANDARD INPUTS
const EMAIL_VALID = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_2 = 'hayden.smith@unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const HANDLE_VALID = 'haydensmith';
const NEW_HANDLE_VALID = 'ilovehayden1';

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

    // check return type of setHandle
    const setRes = PUT(userProfileSethandlePATH, {
      token: BODY(registerRes).token,
      handleStr: NEW_HANDLE_VALID
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

    // check the user's handleStr
    const profileRes1 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes1.statusCode).toBe(OK);
    expect(BODY(profileRes1).user.handleStr).toBe(HANDLE_VALID);

    // change the user's handleStr
    const setRes = PUT(userProfileSethandlePATH, {
      token: BODY(registerRes).token,
      handleStr: NEW_HANDLE_VALID
    });
    expect(setRes.statusCode).toBe(OK);
    expect(BODY(setRes)).toStrictEqual({});

    // check that the user's handleStr has been updated
    const profileRes2 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes2.statusCode).toBe(OK);
    expect(BODY(profileRes2).user.handleStr).toBe(NEW_HANDLE_VALID);
  });

  test('return no error if handle is set to currently existing handle', () => {
    // register a user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // change the user's handleStr
    const setRes = PUT(userProfileSethandlePATH, {
      token: BODY(registerRes).token,
      handleStr: HANDLE_VALID
    });
    expect(setRes.statusCode).toBe(OK);
    expect(BODY(setRes)).toStrictEqual({});

    // check the user's handleStr
    const profileRes1 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes1.statusCode).toBe(OK);
    expect(BODY(profileRes1).user.handleStr).toBe(HANDLE_VALID);
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

    // call userProfileSethandle with invalid token
    const TOKEN_INVALID = BODY(registerRes).token + '0';

    const setRes = PUT(userProfileSethandlePATH, {
      token: TOKEN_INVALID,
      handleStr: NEW_HANDLE_VALID
    });
    expect(setRes.statusCode).toBe(FORBIDDEN);

    // check that user's handleStr has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.handleStr).toBe(HANDLE_VALID);
  });

  test('error upon invalid handleStr (too long, too short, invalid format)', () => {
    // register a user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // call userProfileSethandle with handleStr too short
    const setRes1 = PUT(userProfileSethandlePATH, {
      token: BODY(registerRes).token,
      handleStr: 'ab'
    });
    expect(setRes1.statusCode).toBe(BAD_REQUEST);

    // call userProfileSethandle with handleStr too long
    const setRes2 = PUT(userProfileSethandlePATH, {
      token: BODY(registerRes).token,
      handleStr: 'morethantwentycharactersisbadrip'
    });
    expect(setRes2.statusCode).toBe(BAD_REQUEST);

    // call userProfileSethandle with handleStr with non-alpha-numeric characters
    const setRes3 = PUT(userProfileSethandlePATH, {
      token: BODY(registerRes).token,
      handleStr: '**akls)dj;fa.398'
    });
    expect(setRes3.statusCode).toBe(BAD_REQUEST);

    // check that user's handleStr has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.handleStr).toBe(HANDLE_VALID);
  });

  test('error upon handleStr already used', () => {
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

    // try to update user2's handleStr to user1's handleStr
    const setRes = PUT(userProfileSethandlePATH, {
      token: BODY(registerRes2).token,
      handleStr: HANDLE_VALID
    });
    expect(setRes.statusCode).toBe(BAD_REQUEST);

    // check that user2's handleStr has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes2).token,
      uId: BODY(registerRes2).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.handleStr).toBe(HANDLE_VALID + '0');
  });
});
