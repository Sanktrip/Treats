import { POST, DELETE, BODY, GET } from './httpRequestsV1';
import { expect } from '@jest/globals';
import { clearPATH, dmCreatePATH, authRegisterPATH, dmListPATH, dmLeavePATH } from './httpRequestsV1';

const OK = 200;
const FORBIDDEN = 403;

// standard inputs
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_3 = 'fluffy.unicorns@mailinator.com';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const HANDLE_VALID = 'haydensmith';

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('Testing valid inputs', () => {
  test('Non-empty and empty lists', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const dm = POST(dmCreatePATH, {
      token: BODY(user2).token,
      uIds: [BODY(user3).authUserId]
    });

    const dmList = GET(dmListPATH, {
      token: BODY(user).token
    });

    const dmList2 = GET(dmListPATH, {
      token: BODY(user2).token
    });

    expect(dmList.statusCode).toBe(OK);
    expect(dmList2.statusCode).toBe(OK);

    expect(BODY(dmList)).toStrictEqual({ dms: [] });

    expect(BODY(dmList2)).toStrictEqual({
      dms: [
        {
          dmId: expect.any(Number),
          name: 'haydensmith0, haydensmith1'
        }
      ]
    });
  });

  test('Multiple dms', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const dm = POST(dmCreatePATH, {
      token: BODY(user2).token,
      uIds: [BODY(user3).authUserId]
    });

    const dm2 = POST(dmCreatePATH, {
      token: BODY(user3).token,
      uIds: [BODY(user2).authUserId]
    });

    const dm3 = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId]
    });

    const dmList = GET(dmListPATH, {
      token: BODY(user2).token
    });

    expect(dmList.statusCode).toBe(OK);

    expect(BODY(dmList)).toStrictEqual({
      dms: [
        {
          dmId: expect.any(Number),
          name: 'haydensmith0, haydensmith1'
        },
        {
          dmId: expect.any(Number),
          name: 'haydensmith0, haydensmith1'
        },
        {
          dmId: expect.any(Number),
          name: 'haydensmith, haydensmith0'
        }
      ]
    });
  });
});

test('Invalid token', () => {
  const user = POST(authRegisterPATH, {
    email: EMAIL_VALID,
    password: PASSWORD_VALID,
    nameFirst: FIRSTNAME_VALID,
    nameLast: LASTNAME_VALID
  });

  const user2 = POST(authRegisterPATH, {
    email: EMAIL_VALID_2,
    password: PASSWORD_VALID,
    nameFirst: FIRSTNAME_VALID,
    nameLast: LASTNAME_VALID
  });

  const dm = POST(dmCreatePATH, {
    token: BODY(user).token,
    uIds: [BODY(user2).authUserId]
  });
  expect(dm.statusCode).toBe(OK);

  const dmList = GET(dmListPATH, {
    token: BODY(user).token + 'a'
  });
  expect(dmList.statusCode).toBe(FORBIDDEN);
});
