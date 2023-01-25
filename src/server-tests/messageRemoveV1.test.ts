import {
  GET, DELETE, POST, BODY,
  clearPATH,
  authRegisterPATH,
  channelsCreatePATH,
  channelJoinPATH, channelLeavePATH, channelMessagesPATH,
  dmCreatePATH, dmLeavePATH,
  messageRemovePATH, messageSendPATH, messageSendDmPATH, dmMessagesPATH
} from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const SUCCESS = {};

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

const CHANNEL_NAME_VALID = 'Imagine Dragons';
const ISPUBLIC_VALID = true;

const MESSAGE_VALID = 'howdy, hows everyone going';

// tests
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing message/remove/v1 functionality', () => {
  test('user can remove their own messages in dm', () => {
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

    // user1 creates a dm to user2
    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId]
    });

    // user2 sends a message
    const messageSend = POST(messageSendDmPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      message: MESSAGE_VALID
    });

    // user2 removes message, expect {}
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(OK);
    expect(BODY(remove)).toStrictEqual(SUCCESS);

    // use dm/messages/v1 to check, expect BAD_REQUEST (since no messages left)
    const messages = GET(dmMessagesPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      start: 1
    });
    expect(messages.statusCode).toBe(BAD_REQUEST);
  });

  test('creators can remove others dm messages', () => {
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

    // user2 creates a dm to user1
    const dm = POST(dmCreatePATH, {
      token: BODY(user2).token,
      uIds: [BODY(user1).authUserId]
    });

    // user1 sends a message
    const messageSend = POST(messageSendDmPATH, {
      token: BODY(user1).token,
      dmId: BODY(dm).dmId,
      message: MESSAGE_VALID
    });

    // use dm/messages/v1 to check
    const messages1 = GET(dmMessagesPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      start: 0
    });
    expect(messages1.statusCode).toBe(OK);
    expect(BODY(messages1).messages[0].message).toBe(MESSAGE_VALID);

    // user2 removes message, expect {}
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(OK);
    expect(BODY(remove)).toStrictEqual(SUCCESS);

    // use dm/messages/v1 to check
    const messages2 = GET(dmMessagesPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      start: 1
    });
    expect(messages2.statusCode).toBe(BAD_REQUEST);
  });

  test('user can remove their own messages in channel', () => {
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

    // user2 joins channel
    const join = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join)).toStrictEqual({});

    // user2 sends a message
    const messageSend = POST(messageSendPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // user2 removes message, expect {}
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(OK);
    expect(BODY(remove)).toStrictEqual(SUCCESS);

    // use channel/messages/v2 to check, expect BAD_REQUEST (since no messages left)
    const messages = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 1
    });
    expect(messages.statusCode).toBe(BAD_REQUEST);
  });

  test('owner can remove others messages in channel', () => {
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

    // user2 creates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user2).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 joins channel
    const join = POST(channelJoinPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join)).toStrictEqual({});

    // user1 sends a message
    const messageSend = POST(messageSendPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // use channel/messages/v2 to check
    const messages1 = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 0
    });
    expect(messages1.statusCode).toBe(OK);
    expect(BODY(messages1).messages[0].message).toBe(MESSAGE_VALID);

    // user2 (owner but not sender) edits message, expect {}
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(OK);
    expect(BODY(remove)).toStrictEqual(SUCCESS);

    // use channel/messages/v2 to check
    const messages2 = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 1
    });
    expect(messages2.statusCode).toBe(BAD_REQUEST);
  });

  test('global owner can remove others messages in channel', () => {
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

    // user2 creates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user2).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 joins channel
    const join = POST(channelJoinPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join)).toStrictEqual({});

    // user2 sends a message
    const messageSend = POST(messageSendPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // user1 (global owner) removes message, expect {}
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(OK);
    expect(BODY(remove)).toStrictEqual(SUCCESS);

    // use channel/messages/v2 to check, expect BAD_REQUEST (since no messages left)
    const messages = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 1
    });
    expect(messages.statusCode).toBe(BAD_REQUEST);
  });
});

describe('error handling', () => {
  test('invalid token', () => {
    // register a user
    const user1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    // user1 creates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 sends a message to the channel
    const messageSend = POST(messageSendPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // call messageRemove but with invalid token, expect FORBIDDEN
    const invalidToken = BODY(user1).token + 'lolz';
    const remove = DELETE(messageRemovePATH, {
      token: invalidToken,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(FORBIDDEN);
  });

  test('invalid messageId', () => {
    // register a user
    const user1 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });

    // user1 creates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user1).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 sends a message to the channel
    const messageSend = POST(messageSendPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // call messageRemove but with invalid messageId, expect BAD_REQUEST
    const invalidMessageId = BODY(messageSend).messageId + 999;
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user1).token,
      messageId: invalidMessageId
    });
    expect(remove.statusCode).toBe(BAD_REQUEST);
  });

  test('user not in same channel as message', () => {
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

    // user2 joins channel
    const join = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join)).toStrictEqual({});

    // user1 sends a message to the channel
    const messageSend = POST(messageSendPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // user1 leaves the channel
    const leave = POST(channelLeavePATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(leave)).toStrictEqual({});

    // user1 tries to remove the message they sent, expect BAD_REQUEST
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(BAD_REQUEST);
  });

  test('user not in same dm as message', () => {
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

    // user1 creates a dm to user2 and user3
    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId]
    });

    // user1 sends a message to the dm
    const messageSend = POST(messageSendDmPATH, {
      token: BODY(user1).token,
      dmId: BODY(dm).dmId,
      message: MESSAGE_VALID
    });

    // user1 leaves the dm
    const dmLeave = POST(dmLeavePATH, {
      token: BODY(user1).token,
      dmId: BODY(dm).dmId
    });
    expect(BODY(dmLeave)).toStrictEqual({});

    // user1 tries to remove the message they sent, expect BAD_REQUEST
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(BAD_REQUEST);
  });

  test('user did not send the message in channel', () => {
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

    // user2 joins
    const join = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join)).toStrictEqual({});

    // user1 sends a message
    const messageSend = POST(messageSendPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // user2 tries to remove message, expect FORBIDDEN
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(FORBIDDEN);
  });

  test('user did not send the message in dm', () => {
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

    // user1 creates a dm to user2 and user3
    const dm = POST(dmCreatePATH, {
      token: BODY(user1).token,
      uIds: [BODY(user2).authUserId, BODY(user3).authUserId]
    });

    // user2 sends a message to the dm
    const messageSend = POST(messageSendDmPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      message: MESSAGE_VALID
    });

    // user3 tries to remove message, expect FORBIDDEN
    const remove = DELETE(messageRemovePATH, {
      token: BODY(user3).token,
      messageId: BODY(messageSend).messageId
    });
    expect(remove.statusCode).toBe(FORBIDDEN);
  });
});
