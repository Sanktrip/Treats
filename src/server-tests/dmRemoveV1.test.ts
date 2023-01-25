import {
  GET, POST, DELETE, BODY,
  dmRemovePATH, authRegisterPATH, dmCreatePATH, dmDetailsPATH, dmListPATH, dmLeavePATH, clearPATH
} from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// STANDARD INPUTS
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

// tests
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe(`${dmRemovePATH} correct functionality`, () => {
  test('one dm created and removed', () => {
    // register two users
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

    // user1 creates a dm
    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    // user1 removes the dm
    const remove = DELETE(dmRemovePATH, {
      token: BODY(user1).token,
      dmId: BODY(dm).dmId
    });
    expect(remove.statusCode).toBe(OK);
    expect(BODY(remove)).toStrictEqual({});

    // check that dm/list/v1 returns []
    const list1 = GET(dmListPATH, {
      token: BODY(user1).token
    });
    const list2 = GET(dmListPATH, {
      token: BODY(user2).token
    });
    expect(BODY(list1).dms).toStrictEqual([]);
    expect(BODY(list2).dms).toStrictEqual([]);

    // check that dm/details/v1 return BAD_REQUEST
    const details = GET(dmDetailsPATH, {
      token: BODY(user1).token,
      dmId: BODY(dm).dmId
    });
    expect(details.statusCode).toBe(BAD_REQUEST)
  });
  test('two dms created, one removed', () => {
    // register three users
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

    // user1 creates a dm to user2
    const dm1 = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    // user1 creates a dm to user3
    const dm2 = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user3).authUserId]
    });

    // user1 removes dm to user2
    const remove = DELETE(dmRemovePATH, {
      token: BODY(user1).token,
      dmId: BODY(dm1).dmId
    });
    expect(remove.statusCode).toBe(OK);
    expect(BODY(remove)).toStrictEqual({});

    // check that dm/list/v1 return [] for user2
    const list1 = GET(dmListPATH, {
      token: BODY(user1).token
    });
    const list2 = GET(dmListPATH, {
      token: BODY(user2).token
    });
    expect(BODY(list1).dms.length).toBe(1);
    expect(BODY(list2).dms).toStrictEqual([]);

    // check that dm/details/v1 return BAD_REQUEST
    const details1 = GET(dmDetailsPATH, {
      token: BODY(user1).token,
      dmId: BODY(dm1).dmId
    });
    expect(details1.statusCode).toBe(BAD_REQUEST);

    const details2 = GET(dmDetailsPATH, {
      token: BODY(user3).token,
      dmId: BODY(dm2).dmId
    });
    expect(details2.statusCode).toBe(OK);
  });
});

describe(`${dmRemovePATH} error handling`, () => {
  test('invalid token', () => {
    // register two users
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

    // user1 creates dm to user2
    const dm1 = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    // call dm remove with invalid token, expect FORBIDDEN 403
    const invalidToken = BODY(user1).token + BODY(user2).token + 'lolz';
    const remove = DELETE(dmRemovePATH, {
      token: invalidToken,
      dmId: BODY(dm1).dmId
    });
    expect(remove.statusCode).toBe(FORBIDDEN);
  });

  test('invalid dmId passed in', () => {
    // register two users
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

    // user1 creates dm to user2
    const dm1 = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    // call dmRemove with invalid dmId, expect BAD_REQUEST
    const invalidDmId = BODY(dm1).dmId + 1;
    const remove = DELETE(dmRemovePATH, {
      token: BODY(user1).token,
      dmId: invalidDmId
    });
    expect(remove.statusCode).toBe(BAD_REQUEST);
  });

  test('dmRemove called by not dm creator', () => {
    // register two users
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

    // user1 creates dm to user2
    const dm1 = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    // user2 calls dmRemove, expect FORBIDDEN
    const remove = DELETE(dmRemovePATH, {
      token: BODY(user2).token,
      dmId: BODY(dm1).dmId
    });
    expect(remove.statusCode).toBe(FORBIDDEN);
  });

  test('dm creator has left', () => {
    // register three users
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

    // user1 creates dm to user2 and user3
    const dm1 = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId]
    });

    // user1 leaves dm
    const leave = POST(dmLeavePATH, {
      token: BODY(user1).token,
      dmId: BODY(dm1).dmId
    });
    expect(BODY(leave)).toStrictEqual({});

    // user1 calls dmRemove, expect FORBIDDEN
    const remove = DELETE(dmRemovePATH, {
      token: BODY(user1).token,
      dmId: BODY(dm1).dmId
    });
    expect(remove.statusCode).toBe(FORBIDDEN);
  });
});
