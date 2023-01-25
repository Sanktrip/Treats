// @ts-nocheck

import { expect } from '@jest/globals';
import { DELETE, POST, BODY, GET } from './httpRequestsV1';
import { authRegisterPATH, clearPATH, channelsCreatePATH, channelsListallPATH } from './httpRequestsV1';

const OK = 200;
const FORBIDDEN = 403;

// valid inputs to authRegisterV1 function to setup tests
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const EMAIL_VALID_2 = 'hayhay@gmail.com';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';
const CHANNEL_NAME_VALID = 'Imagine Dragons';
const ISPUBLIC_VALID = true;
const INVALID_TOKEN = 0;

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('returns correct output', () => {
  test('empty channels array', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const allChannels = GET(channelsListallPATH, { token: BODY(user).token });
    expect(BODY(allChannels)).toStrictEqual({ channels: [] });
  });

  test('returns all channels when user is part of all channels', () => {
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

    let allChannels = GET(channelsListallPATH, { token: user.token });
    allChannels = BODY(allChannels);
    // use Set as order doesn't matter -- assumption
    allChannels.channels = new Set(allChannels.channels);

    expect(allChannels).toStrictEqual({
      channels: new Set([
        {
          channelId: channel1.channelId,
          name: CHANNEL_NAME_VALID,
        },
        {
          channelId: channel2.channelId,
          name: CHANNEL_NAME_VALID,
        },
        {
          channelId: channel3.channelId,
          name: CHANNEL_NAME_VALID,
        }
      ])
    });
  });

  test('returns all channels when user is part of some channels', () => {
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

    let allChannels = GET(channelsListallPATH, { token: user.token });
    allChannels = BODY(allChannels);
    // use Set as order doesn't matter -- assumption
    allChannels.channels = new Set(allChannels.channels);

    expect(allChannels).toStrictEqual({
      channels: new Set([
        {
          channelId: channel1.channelId,
          name: CHANNEL_NAME_VALID,
        },
        {
          channelId: channel2.channelId,
          name: CHANNEL_NAME_VALID,
        },
        {
          channelId: channel4.channelId,
          name: CHANNEL_NAME_VALID,
        },
        {
          channelId: channel3.channelId,
          name: CHANNEL_NAME_VALID,
        }
      ])
    });
  });

  test('returns all channels when user is part of no channels', () => {
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

    let allChannels = GET(channelsListallPATH, { token: user.token });
    allChannels = BODY(allChannels);
    // use Set as order doesn't matter -- assumption
    allChannels.channels = new Set(allChannels.channels);

    expect(allChannels).toStrictEqual({
      channels: new Set([
        {
          channelId: channel1.channelId,
          name: CHANNEL_NAME_VALID,
        },
        {
          channelId: channel2.channelId,
          name: CHANNEL_NAME_VALID,
        }
      ])
    });
  });
});

describe('correct error handling', () => {
  test('invalid token', () => {
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
    const result = GET(channelsListallPATH, { token: INVALID_TOKEN });
    expect(result.statusCode).toBe(FORBIDDEN);
  });
});
