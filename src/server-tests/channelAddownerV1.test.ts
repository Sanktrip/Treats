import {
  GET, POST, DELETE, BODY,
  clearPATH, channelAddownerPATH, channelJoinPATH, authRegisterPATH, channelsCreatePATH, channelDetailsPATH
} from './httpRequestsV1';

import { expect } from '@jest/globals';

// standard outputs
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
const HANDLE_VALID = 'haydensmith';

const FIRSTNAME_VALID_2 = 'Josh';
const LASTNAME_VALID_2 = 'Lim';
const HANDLE_VALID_2 = 'joshlim';

const FIRSTNAME_VALID_3 = 'Yuanyuan';
const LASTNAME_VALID_3 = 'Shi';
const HANDLE_VALID_3 = 'yuanyuanshi';

// inputs for function channelsCreateV1 to setup tests
const CHANNEL_NAME_VALID = 'Imagine Dragons';
const ISPUBLIC_VALID = true;

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('channelAddownerV1 return errors', () => {
  test('channelId does not refer to a valid channel', () => {
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

    // user1 creates a channel
    const result1 = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user2 joins the channel
    const result2 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(result1).channelId
    });

    // call channelAddowner with invalid channelId
    const channelIdInvalid = BODY(result1).channelId + 1;
    const result3 = POST(channelAddownerPATH, {
      token: BODY(user1).token,
      channelId: channelIdInvalid,
      uId: BODY(user2).authUserId
    });
    expect(result3.statusCode).toBe(BAD_REQUEST);
  });

  test('uId does not refer to a valid user', () => {
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

    // user1 creaates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 tries to add invalid uId to owner
    const uIdInvalid = BODY(user1).authUserId + BODY(user2).authUserId + 99999;
    const result = POST(channelAddownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: uIdInvalid
    });
    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('uId refers to a user who is not a member of the channel', () => {
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

    // user1 creates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 tries to promote user2 but user2 is not in channel
    const result = POST(channelAddownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId
    });
    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('uId refers to a user who is already an owner of the channel', () => {
    // register one user
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    // user creates channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user tries to add themselves as an owner by they already are
    const result = POST(channelAddownerPATH, {
      token: BODY(user).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user).authUserId
    });
    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('channelId is valid but and the authorised user does not have owner permissions in the channel', () => {
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

    // user1 creates the channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user2 and user3 join the channel
    const result1 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    const result2 = POST(channelJoinPATH, {
      token: BODY(user3).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(result1)).toStrictEqual({});
    expect(BODY(result2)).toStrictEqual({});

    // user2 tries to promote user3 but user2 isnt a channel owner
    const result3 = POST(channelAddownerPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });

    expect(result3.statusCode).toBe(FORBIDDEN);
  });
});

describe('channelAddownerV1 with correct inputs', () => {
  test('channel owner adds owner', () => {
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

    // user1 creates the channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user2 joins the channel
    const result1 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    // user1 adds user2 as owner
    const result2 = POST(channelAddownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId
    });

    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    // check that channels data has been updated
    const channelDetails2 = GET(channelDetailsPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    const expected = BODY(channelDetails2);
    expected.ownerMembers = new Set(expected.ownerMembers);
    expected.allMembers = new Set(expected.allMembers);

    expect(expected).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: new Set([
        {
          uId: BODY(user1).authUserId,
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
          nameLast: LASTNAME_VALID_2,
          handleStr: HANDLE_VALID_2,
          profileImgUrl: expect.any(String),
        }
      ]),
      allMembers: new Set([
        {
          uId: BODY(user1).authUserId,
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
          nameLast: LASTNAME_VALID_2,
          handleStr: HANDLE_VALID_2,
          profileImgUrl: expect.any(String),
        }
      ])
    });
  });

  test('global owner adds owner', () => {
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

    // user1 (global owner) adds user3 as owner
    const result2 = POST(channelAddownerPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });

    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    // check that channels data has been updated
    const channelDetails2 = GET(channelDetailsPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    const expected = BODY(channelDetails2);
    expected.ownerMembers = new Set(expected.ownerMembers);
    expected.allMembers = new Set(expected.allMembers);

    expect(expected).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: new Set([
        {
          uId: BODY(user2).authUserId,
          email: EMAIL_VALID_2,
          nameFirst: FIRSTNAME_VALID_2,
          nameLast: LASTNAME_VALID_2,
          handleStr: HANDLE_VALID_2,
          profileImgUrl: expect.any(String),
        },
        {
          uId: BODY(user3).authUserId,
          email: EMAIL_VALID_3,
          nameFirst: FIRSTNAME_VALID_3,
          nameLast: LASTNAME_VALID_3,
          handleStr: HANDLE_VALID_3,
          profileImgUrl: expect.any(String),
        }
      ]),
      allMembers: new Set([
        {
          uId: BODY(user1).authUserId,
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
          nameLast: LASTNAME_VALID_2,
          handleStr: HANDLE_VALID_2,
          profileImgUrl: expect.any(String),
        },
        {
          uId: BODY(user3).authUserId,
          email: EMAIL_VALID_3,
          nameFirst: FIRSTNAME_VALID_3,
          nameLast: LASTNAME_VALID_3,
          handleStr: HANDLE_VALID_3,
          profileImgUrl: expect.any(String),
        }
      ])
    });
  });
});
