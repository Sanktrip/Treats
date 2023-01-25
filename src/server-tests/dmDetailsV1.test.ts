// @ts-nocheck

import {
  GET, BODY, DELETE, POST,
  clearPATH, authRegisterPATH, dmCreatePATH, dmDetailsPATH
} from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;

// STANDARD INPUTS
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_3 = 'fluffy.unicorns@mailinator.com';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const FIRSTNAME_VALID_2 = 'Sank';
const FIRSTNAME_VALID_3 = 'Dan';
const LASTNAME_VALID = 'Smith';
const HANDLE_VALID = 'haydensmith';
const HANDLE_VALID_2 = 'sanksmith';
const HANDLE_VALID_3 = 'dansmith';

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('correct functionality', () => {
  test('correct output for one existent dm', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID
    });

    // create the dm
    const dm = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId]
    });

    const details = GET(dmDetailsPATH, {
      token: BODY(user).token,
      dmId: BODY(dm).dmId
    });
    expect(details.statusCode).toBe(OK);

    const output = BODY(details);
    output.members = new Set(output.members);

    expect(output).toStrictEqual({
      name: `${HANDLE_VALID}, ${HANDLE_VALID_2}`,
      members: new Set([
        {
          uId: BODY(user).authUserId,
          email: EMAIL_VALID,
          nameFirst: FIRSTNAME_VALID,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID,
          profileImgUrl: expect.any(String),
        },
        {
          uId: BODY(user2).authUserId,
          email: EMAIL_VALID_2,
          nameFirst: FIRSTNAME_VALID_2,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID_2,
          profileImgUrl: expect.any(String),
        },
      ])
    });
  });

  // correct output for multiple dms existing
  test('correct output', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID
    });
    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_3,
      nameLast: LASTNAME_VALID
    });

    // create the dm
    const dm = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user3).authUserId]
    });
    const dm2 = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId]
    });

    const details = GET(dmDetailsPATH, {
      token: BODY(user3).token,
      dmId: BODY(dm2).dmId
    });
    expect(details.statusCode).toBe(OK);

    const output = BODY(details);
    output.members = new Set(output.members);

    expect(output).toStrictEqual({
      name: `${HANDLE_VALID_3}, ${HANDLE_VALID}, ${HANDLE_VALID_2}`,
      members: new Set([
        {
          uId: BODY(user).authUserId,
          email: EMAIL_VALID,
          nameFirst: FIRSTNAME_VALID,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID,
          profileImgUrl: expect.any(String),
        },
        {
          uId: BODY(user2).authUserId,
          email: EMAIL_VALID_2,
          nameFirst: FIRSTNAME_VALID_2,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID_2,
          profileImgUrl: expect.any(String),
        },
        {
          uId: BODY(user3).authUserId,
          email: EMAIL_VALID_3,
          nameFirst: FIRSTNAME_VALID_3,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID_3,
          profileImgUrl: expect.any(String),
        },
      ])
    });
  });
});

describe('error handling', () => {
  test('error: invalid token', () => {
    // register users
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID
    });
    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_3,
      nameLast: LASTNAME_VALID
    });

    // create the dm
    const dm = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId]
    });

    const invalidToken = BODY(user).token + '0';

    const details = GET(dmDetailsPATH, {
      token: invalidToken,
      dmId: BODY(dm).dmId
    });
    expect(details.statusCode).toBe(FORBIDDEN);
  });

  test('error: invalid dmId', () => {
    // register users
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID
    });
    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_3,
      nameLast: LASTNAME_VALID
    });

    // create the dm
    const dm = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId]
    });

    const invalidDmId = BODY(dm).dmId + 1;

    const details = GET(dmDetailsPATH, {
      token: BODY(user).token,
      dmId: invalidDmId
    });
    expect(details.statusCode).toBe(BAD_REQUEST);
  });

  test('error: user is not part of dm', () => {
    // register users
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID
    });
    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_3,
      nameLast: LASTNAME_VALID
    });

    // create the dm
    const dm = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId]
    });

    const details = GET(dmDetailsPATH, {
      token: BODY(user3).token,
      dmId: BODY(dm).dmId
    });
    expect(details.statusCode).toBe(FORBIDDEN);
  });
});
