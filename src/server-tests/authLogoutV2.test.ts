import {
  GET, POST, DELETE, BODY,
  clearPATH, authLogoutPATH, usersAllPATH, authRegisterPATH, userProfilePATH
} from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const FORBIDDEN = 403;

// STANDARD INPUTS
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('authLogoutV1 correct functionality', () => {
  test('invalidates token after logout', () => {
    // register user (expect OK)
    const register = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(register.statusCode).toBe(OK);

    // call getAll users (expect OK)
    const getAllUsers1 = GET(usersAllPATH, {
      token: BODY(register).token,
    });
    expect(getAllUsers1.statusCode).toBe(OK);

    // call userProfile (expect OK)
    const userProfile1 = GET(userProfilePATH, {
      token: BODY(register).token,
      uId: BODY(register).authUserId
    });

    // logout user
    const res = POST(authLogoutPATH, {
      token: BODY(register).token,
    });
    expect(res.statusCode).toBe(OK);
    expect(BODY(res)).toStrictEqual({});

    // call getAll users again (expect FORBIDDEN)
    const getAllUsers2 = GET(usersAllPATH, {
      token: BODY(register).token,
    });
    expect(getAllUsers2.statusCode).toBe(FORBIDDEN);

    // call userProfile again (expect FORBIDDEN)
    const userProfile2 = GET(userProfilePATH, {
      token: BODY(register).token,
      uId: BODY(register).authUserId
    });
    expect(userProfile2.statusCode).toBe(FORBIDDEN);
  });
});

describe('authLogoutV1 error handling', () => {
  test('error upon invalid token', () => {
    const res = POST(authLogoutPATH, {
      token: 'invalid token',
    });

    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
