import { POST, DELETE, BODY, GET } from './httpRequestsV1';
import { expect } from '@jest/globals';
import { clearPATH, dmCreatePATH, authRegisterPATH, dmListPATH } from './httpRequestsV1';

const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_3 = 'fluffy.unicorns@mailinator.com';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const FIRSTNAME_VALID_2 = 'Sank';
const FIRSTNAME_VALID_3 = 'Dan';
const LASTNAME_VALID = 'Smith';

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('Invalid uId return value', () => {
  // TODO: add test for invalid token => returns FORBIDDEN 403

  test('Invalid uId', () => {
    const result = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const result1 = POST(dmCreatePATH, {
      token: BODY(result).token,
      uIds: [BODY(result).authUserId + 1]
    });

    expect(result1.statusCode).toBe(BAD_REQUEST);
  });

  test('duplicate uId', () => {
    const result = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const result2 = POST(dmCreatePATH, {
      token: BODY(result).token,
      uIds: [BODY(result).authUserId, BODY(result).authUserId, BODY(result).authUserId, BODY(result).authUserId]
    });
    expect(result2.statusCode).toBe(BAD_REQUEST);
  });

  test('duplicate uId', () => {
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
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId, BODY(user).authUserId, BODY(user2).authUserId]
    });

    expect(dm.statusCode).toBe(BAD_REQUEST);
  });

  test('No uId specified', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const dm = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: []
    });
    expect(dm.statusCode).toBe(BAD_REQUEST);
  });

  test('authuId is within uIds ', () => {
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
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId, BODY(user).authUserId]
    });

    expect(dm.statusCode).toBe(BAD_REQUEST);
  });
});

test('Valid inputs', () => {
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

  const dm = POST(dmCreatePATH, {
    token: BODY(user).token,
    uIds: [BODY(user2).authUserId, BODY(user3).authUserId]
  });

  const dmList = GET(dmListPATH, { token: BODY(user).token });

  expect(BODY(dm)).toMatchObject({
    dmId: expect.any(Number),
  });

  expect(BODY(dmList).dms).toStrictEqual([{ dmId: BODY(dm).dmId, name: 'dansmith, haydensmith, sanksmith' }]);

  expect(dm.statusCode).toBe(OK);
});

test('Handles close', () => {
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
    uIds: [BODY(user3).authUserId, BODY(user).authUserId]
  });

  expect(BODY(dm)).toMatchObject({
    dmId: expect.any(Number),
  });
  expect(dm.statusCode).toBe(OK);
});
