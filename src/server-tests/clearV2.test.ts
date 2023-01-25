import { POST, BODY, DELETE } from './httpRequestsV1';
import { clearPATH, authRegisterPATH, authLoginPATH } from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;

// STANDARD INPUTS
const usrEmail = 'cool.user@hotmail.com.au';
const usrPassword = 'password12345!';
const usrFName = 'Brandon';
const usrLName = 'Sanderson';

// TESTS
beforeEach(() => {
  // clear the dataStore using /clear/v1
  DELETE(clearPATH, {});
});

test('testing correct clearV1 return value', () => {
  const res = DELETE(clearPATH, {});

  expect(BODY(res)).toStrictEqual({});
  expect(res.statusCode).toBe(OK);
});

describe('testing clearV1 functionality', () => {
  test('authLoginV2 returns errors after clearV1', () => {
    // process this test follows (expected response in brackets):
    // register a user (OK) -> login a user (OK) -> clearV1 (OK) -> login the user (ERROR!)

    // register (OK)
    const register = POST(authRegisterPATH, {
      email: usrEmail,
      password: usrPassword,
      nameFirst: usrFName,
      nameLast: usrLName,
    });
    expect(BODY(register)).toMatchObject({
      authUserId: expect.any(Number),
      token: expect.any(String),
    });
    expect(register.statusCode).toBe(OK);

    // login (OK)
    const login = POST(authLoginPATH, {
      email: usrEmail,
      password: usrPassword,
    });
    expect(BODY(register)).toMatchObject({
      authUserId: BODY(register).authUserId,
      token: expect.any(String),
    });
    expect(login.statusCode).toBe(OK);

    // clear (OK)
    const clear = DELETE(clearPATH, {});
    expect(BODY(clear)).toStrictEqual({});
    expect(clear.statusCode).toBe(OK);

    // login again (ERROR), since clearV1 should clear registered users
    const login2 = POST(authLoginPATH, {
      email: usrEmail,
      password: usrPassword,
    });
    expect(login2.statusCode).toBe(BAD_REQUEST);
  });
});
