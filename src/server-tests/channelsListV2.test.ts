// @ts-nocheck
import { expect } from '@jest/globals';

import { DELETE, POST, BODY, GET } from './httpRequestsV1';
import { authRegisterPATH, clearPATH, channelsCreatePATH, channelsListPATH, channelJoinPATH } from './httpRequestsV1';

// TODO: add tests that use channelJoin and channelInvite too!

const FORBIDDEN = 403;

// valid inputs to authRegisterV1 function to setup tests
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'josh.lim@student.unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';

const CHANNEL_NAME_VALID = 'Imagine Dragons';
const ISPUBLIC_VALID = true;

beforeEach(() => {
  DELETE(clearPATH, {});
});

// testing if channelsListV1 functions properly given valid input
describe('channelsListV1 test return value', () => {
  test('correct return type', () => {
    let user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    user = BODY(user);
    let channel = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel = BODY(channel);
    let channelslist = GET(channelsListPATH, { token: user.token });
    channelslist = BODY(channelslist);
    expect(channelslist).toStrictEqual(
      expect.objectContaining({
        channels: expect.any(Array),
      })
    );
  });

  test('correct return value - user that is part of all channels', () => {
    let user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    user = BODY(user);
    let channel1 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel1 = BODY(channel1);
    let channel2 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel2 = BODY(channel2);
    let channel3 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel3 = BODY(channel3);

    let channelslist = GET(channelsListPATH, { token: user.token });
    channelslist = BODY(channelslist);
    channelslist.channels = new Set(channelslist.channels);

    expect(channelslist).toStrictEqual({
      channels: new Set([
        {
          channelId: channel1.channelId,
          name: CHANNEL_NAME_VALID
        },
        {
          channelId: channel2.channelId,
          name: CHANNEL_NAME_VALID
        },
        {
          channelId: channel3.channelId,
          name: CHANNEL_NAME_VALID
        },
      ])
    });
  });
  // channelsJoin must be completed

  test('correct return value - user that joined a channel later on', () => {
    let user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    user = BODY(user);

    let user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    user2 = BODY(user2);

    let channel1 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel1 = BODY(channel1);

    let channel2 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel2 = BODY(channel2);

    let channel3 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel3 = BODY(channel3);

    const joinResult = POST(channelJoinPATH, { token: user2.token, channelId: channel2.channelId });

    const joinResult2 = POST(channelJoinPATH, { token: user2.token, channelId: channel3.channelId });

    let channelslist = GET(channelsListPATH, { token: user2.token });
    channelslist = BODY(channelslist);
    channelslist.channels = new Set(channelslist.channels);

    expect(channelslist).toStrictEqual({
      channels: new Set([
        {
          channelId: channel2.channelId,
          name: CHANNEL_NAME_VALID
        },
        {
          channelId: channel3.channelId,
          name: CHANNEL_NAME_VALID
        },
      ])
    });
  });

  test('correct return value - user that is part of some channels', () => {
    let user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    user = BODY(user);

    let user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    user2 = BODY(user2);

    let channel1 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel1 = BODY(channel1);

    let channel2 = POST(channelsCreatePATH, {
      token: user2.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel2 = BODY(channel2);

    let channel3 = POST(channelsCreatePATH, {
      token: user.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel3 = BODY(channel3);

    let channel4 = POST(channelsCreatePATH, {
      token: user2.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel4 = BODY(channel4);

    let channelslist = GET(channelsListPATH, { token: user.token });
    channelslist = BODY(channelslist);
    channelslist.channels = new Set(channelslist.channels);

    expect(channelslist).toStrictEqual({
      channels: new Set([
        {
          channelId: channel1.channelId,
          name: CHANNEL_NAME_VALID
        },
        {
          channelId: channel3.channelId,
          name: CHANNEL_NAME_VALID
        },
      ])
    });
  });

  test('correct return value - user that is part of no channels', () => {
    let user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    user = BODY(user);

    let user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID_2,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    user2 = BODY(user2);

    let channel1 = POST(channelsCreatePATH, {
      token: user2.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel1 = BODY(channel1);

    let channel2 = POST(channelsCreatePATH, {
      token: user2.token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID,
    });
    channel2 = BODY(channel2);

    let channelslist = GET(channelsListPATH, { token: user.token });
    channelslist = BODY(channelslist);

    expect(channelslist).toStrictEqual({
      channels: []
    });
  });
});

// testing if channelsListV1 returns errors where needed
describe.each([

  ['non-existent user (invalid token)', 0]

])('channelsListV1 error handling', (error, token) => {
  test(`returns error upon ${error}`, () => {
    const channelsList = GET(channelsListPATH, { token: token });
    expect(channelsList.statusCode).toBe(FORBIDDEN)
  });
});
