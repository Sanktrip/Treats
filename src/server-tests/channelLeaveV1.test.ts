import {
  GET, POST, DELETE, BODY,
  clearPATH, channelLeavePATH, channelsCreatePATH, channelJoinPATH, authRegisterPATH, channelDetailsPATH, channelsListPATH, standupStartPATH
} from './httpRequestsV1';

import { expect } from '@jest/globals';

// standard outputs
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// valid inputs to authRegisterV1 functions to setup tests
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';

const PASSWORD_VALID = 'password';

const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const HANDLE_VALID = 'haydensmith';

const FIRSTNAME_VALID_2 = 'Josh';
const LASTNAME_VALID_2 = 'Lim';
const HANDLE_VALID_2 = 'joshlim';

const PASSWORD_INVALID = '';

// inputs for function channelsCreateV1 to setup tests
const CHANNEL_NAME_VALID = 'Imagine Dragons';
const ISPUBLIC_VALID = true;

const VALID_LENGTH = 1;

// testing
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('channelLeaveV1 return errors', () => {
  test('channelId does not refer to a valid channel', () => {
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

    // call channel/leave/v1 with an invalid channel id
    const invalidChannelId = BODY(channel).channelId + 1;
    const result = POST(channelLeavePATH, {
      token: BODY(user).token,
      channelId: invalidChannelId
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('channelId is valid but the authorised user is not a member of the channel', () => {
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

    // user2 tries to leave the channel despite not being a member
    const result = POST(channelLeavePATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });
});

describe('channelLeaveV1 correct return', () => {
  test('channel owner leaves the channel', () => {
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

    // user2 joins the channel as a member
    const join = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join)).toStrictEqual({});

    // user1 leaves channel
    const result = POST(channelLeavePATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});

    // check that user1 is part of no channels now
    const channelList = GET(channelsListPATH, {
      token: BODY(user1).token
    });
    expect(BODY(channelList).channels).toStrictEqual([]);

    // check that owner has left fully
    const channelDetails = GET(channelDetailsPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    expect(BODY(channelDetails)).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [],
      allMembers: [{
        uId: BODY(user2).authUserId,
        email: EMAIL_VALID_2,
        nameFirst: FIRSTNAME_VALID_2,
        nameLast: LASTNAME_VALID_2,
        handleStr: HANDLE_VALID_2,
        profileImgUrl: expect.any(String),
      }]
    });

    // channelDetails should return FORBIDDEN 403 if user1 has left
    const channelDetails2 = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(channelDetails2.statusCode).toBe(FORBIDDEN);
  });

  test('channel member leaves the channel', () => {
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
    expect(BODY(result1)).toStrictEqual({});

    // user2 leaves the channel
    const result2 = POST(channelLeavePATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });

    const channelList = GET(channelsListPATH, {
      token: BODY(user2).token
    });

    expect(BODY(channelList).channels).toStrictEqual([]);
    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    // check that user2 has left
    const channelDetails = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });

    expect(BODY(channelDetails)).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
      ownerMembers: [
        {
          uId: BODY(user1).authUserId,
          email: EMAIL_VALID,
          nameFirst: FIRSTNAME_VALID,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID,
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: BODY(user1).authUserId,
          email: EMAIL_VALID,
          nameFirst: FIRSTNAME_VALID,
          nameLast: LASTNAME_VALID,
          handleStr: HANDLE_VALID,
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});
jest.useFakeTimers();
test('channel remove while standup is active', () => {
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

  const start = POST(standupStartPATH, {
    token: BODY(user1).token,
    channelId: BODY(channel).channelId,
    length: VALID_LENGTH
  });
  const leave = POST(channelLeavePATH, {
    token: BODY(user1).token,
    channelId: BODY(channel).channelId
  });
  expect(leave.statusCode).toBe(BAD_REQUEST)
  expect(start.statusCode).toBe(OK);
  jest.advanceTimersByTime(1000)
});