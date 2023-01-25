// @ts-nocheck
import { POST, DELETE, BODY, GET } from './httpRequestsV1';
import { expect } from '@jest/globals';
import { clearPATH, channelRemoveownerPATH, channelAddownerPATH, channelJoinPATH, authRegisterPATH, channelsCreatePATH, channelDetailsPATH } from './httpRequestsV1';

const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// inputs to authRegisterV1 functions to setup tests
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

// inputs for function channelsCreateV1 to setup tests
const CHANNEL_NAME_VALID = 'Imagine Dragons';
const ISPUBLIC_VALID = true;

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('channelRemoveownerV1 return errors', () => {
  test('channelId does not refer to a valid channel', () => {
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

    const result1 = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    const result2 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(result1).channelId
    });

    const result3 = POST(channelRemoveownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(result1).channelId + 1,
      uId: BODY(user2).authUserId
    });

    expect(result3.statusCode).toBe(BAD_REQUEST);
  });

  test('uId does not refer to a valid user', () => {
    const user1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    const result = POST(channelRemoveownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user1).authUserId + 1
    });
    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('uId refers to a user who is not a owner of the channel', () => {
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

    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    const result1 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    const result2 = POST(channelRemoveownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId
    });

    expect(result2.statusCode).toBe(BAD_REQUEST);
  });

  test('uId refers to a user who is currently the only owner of the channel', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const channel = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    const result = POST(channelRemoveownerPATH, {
      token: BODY(user).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user).authUserId
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('channelId is valid but and the authorised user does not have owner permissions in the channel', () => {
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

    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    const result1 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    const result3 = POST(channelJoinPATH, {
      token: BODY(user3).token,
      channelId: BODY(channel).channelId
    });
    
    const result4 = POST(channelAddownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });

    const result2 = POST(channelRemoveownerPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });

    expect(result2.statusCode).toBe(FORBIDDEN);
  });
});

// implement more correct types later
describe('channelRemoveownerV1 with correct inputs', () => {
  test('channel owner remove owner', () => {
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

    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    const result1 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    const result2 = POST(channelAddownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId
    });

    const result3 = POST(channelRemoveownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId
    });

    const channelDetails = GET(channelDetailsPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    const removed = BODY(channelDetails).ownerMembers;
    expect(removed.includes(BODY(user2).authUserId)).toStrictEqual(false);
    expect(result3.statusCode).toBe(OK);
    expect(BODY(result3)).toStrictEqual({});
  });

  test('global owner removes owner', () => {
    // register three users; user1 = global owner
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

    // user2 creates the channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user2).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 and user3 join the channel
    const join1 = POST(channelJoinPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    const join2 = POST(channelJoinPATH, {
      token: BODY(user3).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join1)).toStrictEqual({});
    expect(BODY(join2)).toStrictEqual({});

    //user2 adds user3 as owner
    const result1 = POST(channelAddownerPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });

    // user1 (global owner) removes user3 as owner
    const result2 = POST(channelRemoveownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });

    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});
  });
});
