// @ts-nocheck
import { POST, DELETE, BODY, GET } from './httpRequestsV1';
import { expect } from '@jest/globals';
import { clearPATH, dmLeavePATH, dmCreatePATH, authRegisterPATH, dmListPATH } from './httpRequestsV1';

// standard outputs
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// valid inputs to authRegisterV1 functions to setup tests
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_3 = 'yuanyuan.shi@student.unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const FIRSTNAME_VALID_2 = 'Josh';
const LASTNAME_VALID_2 = 'Lim';
const FIRSTNAME_VALID_3 = 'Yuanyuan';
const LASTNAME_VALID_3 = 'Shi';

const PASSWORD_INVALID = '';

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('dmLeaveV1 return errors', () => {
  // TODO: add test for invalid token => return FORBIDDEN 403

  test('dmId does not refer to a valid DM', () => {
    const user1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID_2
    });

    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    const result = POST(dmLeavePATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId + 1
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('dmId is valid but the authorised user is not a member of the DM', () => {
    const user1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID_2
    });

    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_3,
      nameLast: LASTNAME_VALID_3
    });

    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    const result = POST(dmLeavePATH, {
      token: BODY(user3).token,
      dmId: BODY(dm).dmId
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });
});

describe('dmLeaveV1 correct return', () => {
  test('DM owner leave the DM', () => {
    const user1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID_2
    });

    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    const result = POST(dmLeavePATH, {
      token: BODY(user1).token,
      dmId: BODY(dm).dmId
    });
    const dmList = GET(dmListPATH, { token: BODY(user1).token });

    expect(BODY(dmList).dms).toStrictEqual([]);
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});
  });

  test('DM member leave the DM', () => {
    const user1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_2,
      nameLast: LASTNAME_VALID_2
    });

    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    const result = POST(dmLeavePATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId
    });

    const dmList = GET(dmListPATH, { token: BODY(user2).token });

    expect(BODY(dmList).dms).toStrictEqual([]);
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});
  });
});
