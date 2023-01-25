import { GET, POST, BODY, DELETE } from './httpRequestsV1';
import { authRegisterPATH, userProfilePATH, usersAllPATH, clearPATH } from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const FORBIDDEN = 403;

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

// testing if users/all/v1 returns the correct output
describe('testing functionality', () => {
  test('returns correct array - one user', () => {
    // register new user
    const register = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID,
    });

    // get all users info + check for correct output
    const res = GET(usersAllPATH, {
      token: BODY(register).token,
    });

    expect(res.statusCode).toBe(OK);
    expect(BODY(res)).toStrictEqual({
      users: [
        {
          uId: BODY(register).authUserId,
          email: EMAIL_VALID,
          nameFirst: FIRSTNAME_VALID,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID,
          profileImgUrl: expect.any(String),
        },
      ]
    });
  });
  test('returns correct array - three users', () => {
    // register new users
    const register1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID,
    });
    const register2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID,
    });
    const register3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID,
    });

    // get all users + check for correct output
    const res = GET(usersAllPATH, {
      token: BODY(register1).token,
    });

    expect(res.statusCode).toBe(OK);
    expect(new Set(BODY(res).users)).toStrictEqual(new Set([
      {
        uId: BODY(register1).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      },
      {
        uId: BODY(register2).authUserId,
        email: EMAIL_VALID_2,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: `${HANDLE_VALID}0`,
        profileImgUrl: expect.any(String),
      },
      {
        uId: BODY(register3).authUserId,
        email: EMAIL_VALID_3,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: `${HANDLE_VALID}1`,
        profileImgUrl: expect.any(String),
      },
    ]));
  });

  const n = 20;
  test(`returns correct array - ${n} users`, () => {
    // register n users
    const users = [];
    for (let i = 0; i < n; i++) {
      const uniqueEmail = `${i}${EMAIL_VALID}`;

      users.push(BODY(POST(authRegisterPATH, {
        email: uniqueEmail,
        password: PASSWORD_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
      })));
    }

    // generate correct output
    const expected = new Set(users.map((user) => BODY(GET(userProfilePATH, {
      token: user.token,
      uId: user.authUserId
    })).user));

    // get all users + check for correct output
    const res = GET(usersAllPATH, {
      token: users[0].token,
    });

    expect(res.statusCode).toBe(OK);
    // expect(BODY(res).length).toBe(n);

    expect(new Set(BODY(res).users)).toStrictEqual(expected);
  });
});

// testing if users/all/v1 correctly handles errors
describe('testing error handling', () => {
  test('returns 403 - invalid token given', () => {
    const register = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID,
    });

    const invalidToken = `invalidToken: ${BODY(register).token}`;

    const res = GET(usersAllPATH, {
      token: invalidToken,
    });

    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
