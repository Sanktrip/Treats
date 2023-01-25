import { expect } from '@jest/globals';
import { GET, POST, DELETE, BODY } from './httpRequestsV1';
import {
  clearPATH,
  channelInvitePATH,
  channelJoinPATH,
  authRegisterPATH,
  channelsCreatePATH,
  channelDetailsPATH
} from './httpRequestsV1';

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

describe('channelInviteV1 return errors', () => {
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

    // create a channel
    const result1 = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // invite user2 to an invalid channelId
    const result2 = POST(channelInvitePATH, {
      token: BODY(user1).token,
      channelId: BODY(result1).channelId + 1,
      uId: BODY(user2).authUserId
    });

    expect(result2.statusCode).toBe(BAD_REQUEST);
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

    // create a valid channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // call channel/invite/v2 with invalid uId
    const result = POST(channelInvitePATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId + BODY(user1).authUserId + 9999999
    });
    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('uId refers to a user who is already a member of the channel', () => {
    // register a user
    const user = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    // create a channel - user is added as an owner and member
    const channel = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // try to invite user to channel
    const result = POST(channelInvitePATH, {
      token: BODY(user).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user).authUserId
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('channelId is valid but the authorised user is not a member of the channel', () => {
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

    // create channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user 2 tries to invite user 3 to channel
    const result = POST(channelInvitePATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });

  test('invalid token passed in', () => {
    // register two users
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

    // create a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // try to invite user2 to channel with invalid token
    const result = POST(channelInvitePATH, {
      token: `${BODY(user).token}${BODY(user2).token}`,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });
});

// implement more correct types later
describe('channelInviteV1 with correct inputs', () => {
  test('channel owner invites others', () => {
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

    // user1 invites user2 to the channel
    const result = POST(channelInvitePATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user2).authUserId
    });

    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});

    // get details of new channel
    const details = GET(channelDetailsPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
    });

    const expected = BODY(details);
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

  test('channel member invites others', () => {
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

    // user1 creates channel, which user2 joins
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });
    const result1 = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(result1)).toStrictEqual({});

    // user2 invites user3 to join channel
    const result2 = POST(channelInvitePATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      uId: BODY(user3).authUserId
    });
    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    // get details of new channel
    const details = GET(channelDetailsPATH, {
      token: BODY(user3).token,
      channelId: BODY(channel).channelId,
    });

    const expected = BODY(details);
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
