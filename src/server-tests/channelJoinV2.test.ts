// @ts-nocheck
import { GET, POST, DELETE, BODY } from './httpRequestsV1';
import { expect } from '@jest/globals';
import {
  clearPATH,
  channelJoinPATH,
  authRegisterPATH,
  channelsCreatePATH,
  channelDetailsPATH
} from './httpRequestsV1';

// standard outputs
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// valid inputs to authRegisterV1 functions to setup tests
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';
const EMAIL_VALID_3 = 'haha@gmail.com';

const PASSWORD_VALID = 'password';

const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const FIRSTNAME_VALID_2 = 'Josh';
const LASTNAME_VALID_2 = 'Lim';
const FIRSTNAME_VALID_3 = 'Daniel';
const LASTNAME_VALID_3 = 'Craig';

const HANDLE_VALID = 'haydensmith';
const HANDLE_VALID_2 = 'joshlim';
const HANDLE_VALID_3 = 'danielcraig';

// inputs for function channelsCreateV1 to setup tests
const CHANNEL_NAME_VALID = 'Imagine Dragons';
const CHANNEL_NAME_INVALID = '';
const ISPUBLIC_VALID = true;
const ISPUBLIC_INVALID = false;

beforeEach(() => {
  DELETE(clearPATH, {});
});

// testing channel/join/v2 error handling
describe('channelJoinV2 return errors', () => {
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

    const invalidChannelId = BODY(result1).channelId + 1;
    const result2 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: invalidChannelId
    });

    expect(result2.statusCode).toBe(BAD_REQUEST);
  });

  test('the authorised user is already a member of the channel', () => {
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

    const result = POST(channelJoinPATH, {
      token: BODY(user).token,
      channelId: BODY(channel).channelId
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner', () => {
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
      isPublic: ISPUBLIC_INVALID
    });

    const result = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });
});

// implement more correct caces later
describe('channelJoinV2 tests with correct inputs', () => {
  test('correct return type + updates dataStore for two users', () => {
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

    // get channel details so far
    const channelDetails1 = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(channelDetails1.statusCode).toBe(OK);
    expect(BODY(channelDetails1)).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user1).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: BODY(user1).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      }]
    });

    // user2 joins the channel
    const result = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});

    // get channel details after user2 has joined
    const channelDetails2 = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(channelDetails2.statusCode).toBe(OK);

    const expected = BODY(channelDetails2);
    expected.allMembers = new Set(expected.allMembers);

    expect(expected).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user1).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      }],
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

  test('correct return type + updates dataStore for three users', () => {
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
    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID_3,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID_3,
      nameLast: LASTNAME_VALID_3
    });

    // user3 creates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user3).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // get channel details so far
    const channelDetails1 = GET(channelDetailsPATH, {
      token: BODY(user3).token,
      channelId: BODY(channel).channelId
    });
    expect(channelDetails1.statusCode).toBe(OK);
    expect(BODY(channelDetails1)).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user3).authUserId,
        email: EMAIL_VALID_3,
        nameFirst: FIRSTNAME_VALID_3,
        nameLast: LASTNAME_VALID_3,
        handleStr: HANDLE_VALID_3,
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: BODY(user3).authUserId,
        email: EMAIL_VALID_3,
        nameFirst: FIRSTNAME_VALID_3,
        nameLast: LASTNAME_VALID_3,
        handleStr: HANDLE_VALID_3,
        profileImgUrl: expect.any(String),
      }]
    });

    // user1 joins the channel
    const result1 = POST(channelJoinPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(result1.statusCode).toBe(OK);
    expect(BODY(result1)).toStrictEqual({});

    // user2 joins the channel
    const result2 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    // get channel details after users have joined
    const channelDetails2 = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(channelDetails2.statusCode).toBe(OK);

    const expected = BODY(channelDetails2);
    expected.allMembers = new Set(expected.allMembers);

    expect(expected).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user3).authUserId,
        email: EMAIL_VALID_3,
        nameFirst: FIRSTNAME_VALID_3,
        nameLast: LASTNAME_VALID_3,
        handleStr: HANDLE_VALID_3,
        profileImgUrl: expect.any(String),
      }],
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

  test('correct return type + updates dataStore for two channels', () => {
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
    const channel1 = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });
    // user2 creates a channel
    const channel2 = POST(channelsCreatePATH, {
      token: BODY(user2).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // get channel1 details so far
    const channelDetails1 = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel1).channelId
    });
    expect(channelDetails1.statusCode).toBe(OK);
    expect(BODY(channelDetails1)).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user1).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: BODY(user1).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      }]
    });
    // get channel2 details so far
    const channelDetails2 = GET(channelDetailsPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel2).channelId
    });
    expect(channelDetails2.statusCode).toBe(OK);
    expect(BODY(channelDetails2)).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user2).authUserId,
        email: EMAIL_VALID_2,
        nameFirst: FIRSTNAME_VALID_2,
        nameLast: LASTNAME_VALID_2,
        handleStr: HANDLE_VALID_2,
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: BODY(user2).authUserId,
        email: EMAIL_VALID_2,
        nameFirst: FIRSTNAME_VALID_2,
        nameLast: LASTNAME_VALID_2,
        handleStr: HANDLE_VALID_2,
        profileImgUrl: expect.any(String),
      }]
    });

    // user1 joins channel2
    const result1 = POST(channelJoinPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel2).channelId
    });
    expect(result1.statusCode).toBe(OK);
    expect(BODY(result1)).toStrictEqual({});
    // user2 joins channel1
    const result2 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel1).channelId
    });
    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    // get channel details after user2 has joined
    const channelDetails3 = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel1).channelId
    });
    expect(channelDetails3.statusCode).toBe(OK);

    const expected1 = BODY(channelDetails3);
    expected1.allMembers = new Set(expected1.allMembers);

    expect(expected1).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user1).authUserId,
        email: EMAIL_VALID,
        nameFirst: FIRSTNAME_VALID,
        nameLast: LASTNAME_VALID,
        handleStr: HANDLE_VALID,
        profileImgUrl: expect.any(String),
      }],
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

    // get channel details after user2 has joined
    const channelDetails4 = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel2).channelId
    });
    expect(channelDetails4.statusCode).toBe(OK);

    const expected2 = BODY(channelDetails4);
    expected2.allMembers = new Set(expected2.allMembers);

    expect(expected2).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [{
        uId: BODY(user2).authUserId,
        email: EMAIL_VALID_2,
        nameFirst: FIRSTNAME_VALID_2,
        nameLast: LASTNAME_VALID_2,
        handleStr: HANDLE_VALID_2,
        profileImgUrl: expect.any(String),
      }],
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
});
