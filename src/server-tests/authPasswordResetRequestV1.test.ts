import { expect } from '@jest/globals';

import { POST, BODY, DELETE } from './httpRequestsV1';
import { authRegisterPATH, authLogoutPATH, clearPATH, authPasswordResetRequestPATH } from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;

// STANDARD INPUTS
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_INVALID = 'josh.lim@student.unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('general return type', () => {
  test('when email address belongs to a registered user', () => {
    const register = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const logout = POST(authLogoutPATH, {
      token: BODY(register).token,
    });

    const request = POST(authPasswordResetRequestPATH, {
      email: EMAIL_VALID,
    });

    expect(request.statusCode).toBe(OK);
    expect(BODY(request)).toStrictEqual({});
  });

  test('shouldnt return error when email address doesnt belongs to a registered user', () => {
    const request = POST(authPasswordResetRequestPATH, {
      email: EMAIL_INVALID,
    });

    expect(request.statusCode).toBe(OK);
    expect(BODY(request)).toStrictEqual({});
  });
});
