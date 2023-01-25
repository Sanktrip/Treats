// @ts-nocheck
import { expect } from '@jest/globals';

import { DELETE, POST, BODY, GET } from './httpRequestsV1';
import { authRegisterPATH, clearPATH, channelsCreatePATH, userProfilePATH, channelDetailsPATH } from './httpRequestsV1';

const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// valid inputs to authRegisterV1 function to setup tests
const EMAIL_VALID = 'hayden.smith@unsw.edu.au';
const PASSWORD_VALID = 'password';
const FIRSTNAME_VALID = 'Hayden';
const LASTNAME_VALID = 'Smith';

const CHANNEL_NAME_VALID = 'Imagine Dragons';

beforeEach(() => {
  DELETE(clearPATH, {});
});

// testing if channelsCreateV1 functions properly given valid input
describe('channelsCreateV1 test return value', () => {
  test('correct return type', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    const channel = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: true,
    });
    expect(channel.statusCode).toBe(OK);
    expect(BODY(channel)).toStrictEqual(
      expect.objectContaining({
        channelId: expect.any(Number),
      })
    );
  });

  test('generates unique channelId for three channels', () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    let channel1 = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: true,
    });
    expect(channel1.statusCode).toBe(OK);
    channel1 = BODY(channel1);
    let channel2 = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: true,
    });
    expect(channel2.statusCode).toBe(OK);
    channel2 = BODY(channel2);
    let channel3 = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: true,
    });
    expect(channel3.statusCode).toBe(OK);
    channel3 = BODY(channel3);
    expect(channel1.channelId).toBeDefined();
    expect(channel2.channelId).toBeDefined();
    expect(channel3.channelId).toBeDefined();
    expect(channel1.channelId).not.toEqual(channel2.channelId);
    expect(channel1.channelId).not.toEqual(channel3.channelId);
    expect(channel2.channelId).not.toEqual(channel3.channelId);
  });

  test('pushes correct data to dataStore', () => {
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
      isPublic: true,
    });
    expect(channel.statusCode).toBe(OK);
    channel = BODY(channel);

    const channelDetails = GET(channelDetailsPATH, { token: user.token, channelId: channel.channelId });

    expect(BODY(channelDetails)).toStrictEqual({
      name: CHANNEL_NAME_VALID,
      isPublic: true,
      ownerMembers: [BODY(GET(userProfilePATH, { token: user.token, uId: user.authUserId })).user],
      allMembers: [BODY(GET(userProfilePATH, { token: user.token, uId: user.authUserId })).user],
    });
  });
});

// testing if channelsCreateV1 returns errors where needed
describe.each([
  ['channel name too long ( > 20 )', 'WE_LOVE_HAYDEN_SO_SO_MUCH', true],
  ['channel name too short ( < 1 )', '', true],
])('channelsCreateV1 error handling', (error, name, isPublic) => {
  test(`returns error upon ${error}`, () => {
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    const channel = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: name,
      isPublic: isPublic,
    });
    expect(channel.statusCode).toBe(BAD_REQUEST)
  });
});

describe('channelsCreateV1 error handling', () => {
  test('returns error upon invalid token', () => {
    const channel = POST(channelsCreatePATH, {
      token: 0,
      name: CHANNEL_NAME_VALID,
      isPublic: true,
    });
    expect(channel.statusCode).toBe(FORBIDDEN);
  });
});
