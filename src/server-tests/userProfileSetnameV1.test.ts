import { POST, PUT, GET, DELETE, BODY } from './httpRequestsV1';
import { authRegisterPATH, userProfilePATH, userProfileSetnamePATH, clearPATH } from './httpRequestsV1';

// STANDARD INPUTS
const EMAIL_VALID = 'josh.lim@student.unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';

const NEW_FIRSTNAME_VALID = 'Josh';
const NEW_LASTNAME_VALID = 'Josh';

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

    // check return type of setName
    const setRes = PUT(userProfileSetnamePATH, {
      token: BODY(registerRes).token,
      nameFirst: NEW_FIRSTNAME_VALID,
      nameLast: NEW_LASTNAME_VALID
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

    // check the user's name
    const profileRes1 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes1.statusCode).toBe(OK);
    expect(BODY(profileRes1).user.nameFirst).toBe(FIRSTNAME_VALID);
    expect(BODY(profileRes1).user.nameLast).toBe(LASTNAME_VALID);

    // change the user's name
    const setRes = PUT(userProfileSetnamePATH, {
      token: BODY(registerRes).token,
      nameFirst: NEW_FIRSTNAME_VALID,
      nameLast: NEW_LASTNAME_VALID
    });
    expect(setRes.statusCode).toBe(OK);
    expect(BODY(setRes)).toStrictEqual({});

    // check that the user's name has been updated
    const profileRes2 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes2.statusCode).toBe(OK);
    expect(BODY(profileRes2).user.nameFirst).toBe(NEW_FIRSTNAME_VALID);
    expect(BODY(profileRes2).user.nameLast).toBe(NEW_LASTNAME_VALID);
  });

  test('return no error if name is set to currently existing name', () => {
    // register a user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // change the user's name
    const setRes = PUT(userProfileSetnamePATH, {
      token: BODY(registerRes).token,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(setRes.statusCode).toBe(OK);
    expect(BODY(setRes)).toStrictEqual({});

    // check the user's name
    const profileRes1 = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes1.statusCode).toBe(OK);
    expect(BODY(profileRes1).user.nameFirst).toBe(FIRSTNAME_VALID);
    expect(BODY(profileRes1).user.nameLast).toBe(LASTNAME_VALID);
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

    // call userProfileSetName with invalid token
    const TOKEN_INVALID = BODY(registerRes).token + '0';

    const setRes = PUT(userProfileSetnamePATH, {
      token: TOKEN_INVALID,
      nameFirst: NEW_FIRSTNAME_VALID,
      nameLast: NEW_LASTNAME_VALID
    });
    expect(setRes.statusCode).toBe(FORBIDDEN);

    // check that user's name has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.nameFirst).toBe(FIRSTNAME_VALID);
    expect(BODY(profileRes).user.nameLast).toBe(LASTNAME_VALID);
  });

  test('error upon invalid nameFirst or nameLast (too long or too short)', () => {
    // register a user
    const registerRes = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(registerRes.statusCode).toBe(OK);

    // call userProfileSetname with nameFirst too short
    const setRes1 = PUT(userProfileSetnamePATH, {
      token: BODY(registerRes).token,
      nameFirst: '',
      nameLast: NEW_LASTNAME_VALID,
    });
    expect(setRes1.statusCode).toBe(BAD_REQUEST);

    // call userProfileSetname with nameFirst too long
    const setRes2 = PUT(userProfileSetnamePATH, {
      token: BODY(registerRes).token,
      nameFirst: 'morethanfiftycharactersisbadrip-morethanfiftycharactersisbadrip',
      nameLast: NEW_LASTNAME_VALID,
    });
    expect(setRes2.statusCode).toBe(BAD_REQUEST);

    // call userProfileSetname with nameLast too short
    const setRes3 = PUT(userProfileSetnamePATH, {
      token: BODY(registerRes).token,
      nameFirst: NEW_FIRSTNAME_VALID,
      nameLast: '',
    });
    expect(setRes3.statusCode).toBe(BAD_REQUEST);

    // call userProfileSetname with nameLast too long
    const setRes4 = PUT(userProfileSetnamePATH, {
      token: BODY(registerRes).token,
      nameFirst: NEW_FIRSTNAME_VALID,
      nameLast: 'morethanfiftycharactersisbadrip-morethanfiftycharactersisbadrip',
    });
    expect(setRes4.statusCode).toBe(BAD_REQUEST);

    // check that user's name has NOT been updated
    const profileRes = GET(userProfilePATH, {
      token: BODY(registerRes).token,
      uId: BODY(registerRes).authUserId
    });
    expect(profileRes.statusCode).toBe(OK);
    expect(BODY(profileRes).user.nameFirst).toBe(FIRSTNAME_VALID);
    expect(BODY(profileRes).user.nameLast).toBe(LASTNAME_VALID);
  });
});
