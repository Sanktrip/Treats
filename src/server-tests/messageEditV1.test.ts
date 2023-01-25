import {
  GET, DELETE, POST, PUT, BODY,
  clearPATH,
  authRegisterPATH,
  channelsCreatePATH,
  channelJoinPATH, channelLeavePATH, channelMessagesPATH,
  dmCreatePATH, dmLeavePATH,
  messageEditPATH, messageSendPATH, messageSendDmPATH, dmMessagesPATH
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
const MESSAGE_NEW_VALID = 'howdy, how is everyone going?!';
const MESSAGE_EMPTY = '';
const MESSAGE_LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam condimentum nibh in porta dignissim. Sed elit lectus, vestibulum eget porttitor luctus, ullamcorper ac dolor. Suspendisse potenti. In hac habitasse platea dictumst. Aenean nulla tortor, maximus ac dui a, rutrum congue ex. Aliquam et consectetur nunc. Aenean a est leo. Donec ex justo, laoreet ut libero at, rhoncus mattis neque. Donec tellus tellus, convallis in rhoncus ut, ullamcorper id arcu. Cras eget lectus non sem congue pulvinar vel quis nulla. Pellentesque et pulvinar odio. Donec fringilla massa ac turpis porta, et viverra purus rhoncus. Nam ornare magna sit amet arcu convallis, at varius lorem dignissim. Curabitur maximus in tellus in pharetra. Phasellus interdum condimentum tellus, vitae suscipit massa. Proin eu tortor tincidunt, maximus augue sit amet, laoreet ipsum. Suspendisse potenti. Donec imperdiet eros ac lorem vestibulum scelerisque ut vehicula felis. Praesent quis lorem odio. Cras consectetur nunc in urna venenatis laoreet. Fusce non consectetur dolor, efficitur bibendum lorem.';

// tests
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing message/edit/v1 functionality', () => {
  test('user can edit their own dm message and creators can edit others dm messages', () => {
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

    // use dm/messages/v1 to check
    const messages1 = GET(dmMessagesPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      start: 0
    });
    expect(messages1.statusCode).toBe(OK);
    expect(BODY(messages1).messages[0].message).toBe(MESSAGE_VALID);

    // user2 edits message, expect {}
    const edit = PUT(messageEditPATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID
    });
    expect(edit.statusCode).toBe(OK);
    expect(BODY(edit)).toStrictEqual(SUCCESS);

    // use dm/messages/v1 to check
    const messages2 = GET(dmMessagesPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      start: 0
    });
    expect(messages2.statusCode).toBe(OK);
    expect(BODY(messages2).messages[0].message).toBe(MESSAGE_NEW_VALID);

    // user1 (dm creator) edits message, expect {}
    const edit2 = PUT(messageEditPATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID + '0'
    });
    expect(edit2.statusCode).toBe(OK);
    expect(BODY(edit2)).toStrictEqual(SUCCESS);

    // use dm/messages/v1 to check
    const messages3 = GET(dmMessagesPATH, {
      token: BODY(user2).token,
      dmId: BODY(dm).dmId,
      start: 0
    });
    expect(messages3.statusCode).toBe(OK);
    expect(BODY(messages3).messages[0].message).toBe(MESSAGE_NEW_VALID + '0');
  });

  test('user can edit their own messages in channel, global owner and channel owner can edit others messages', () => {
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

    // user3 creates a channel
    const channel = POST(channelsCreatePATH, {
      token: BODY(user3).token,
      name: CHANNEL_NAME_VALID,
      isPublic: ISPUBLIC_VALID
    });

    // user1 and user2 joins channel
    const join = POST(channelJoinPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join)).toStrictEqual({});
    const join2 = POST(channelJoinPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId
    });
    expect(BODY(join2)).toStrictEqual({});

    // user2 sends a message
    const messageSend = POST(messageSendPATH, {
      token: BODY(user2).token,
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

    // user2 edits message, expect {}
    const edit = PUT(messageEditPATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID
    });
    expect(edit.statusCode).toBe(OK);
    expect(BODY(edit)).toStrictEqual(SUCCESS);

    // use channel/messages/v2 to check
    const messages2 = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 0
    });
    expect(messages2.statusCode).toBe(OK);
    expect(BODY(messages2).messages[0].message).toBe(MESSAGE_NEW_VALID);

    //

    // user1 (global owner) edits message, expect {}
    const edit2 = PUT(messageEditPATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID + '0'
    });
    expect(edit2.statusCode).toBe(OK);
    expect(BODY(edit2)).toStrictEqual(SUCCESS);

    // use channel/messages/v2 to check
    const messages3 = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 0
    });
    expect(messages3.statusCode).toBe(OK);
    expect(BODY(messages3).messages[0].message).toBe(MESSAGE_NEW_VALID + '0');

    //

    // user3 (channel owner) edits message, expect {}
    const edit3 = PUT(messageEditPATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID + '10'
    });
    expect(edit3.statusCode).toBe(OK);
    expect(BODY(edit3)).toStrictEqual(SUCCESS);

    // use channel/messages/v2 to check
    const messages4 = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 0
    });
    expect(messages4.statusCode).toBe(OK);
    expect(BODY(messages4).messages[0].message).toBe(MESSAGE_NEW_VALID + '10');
  });
  
  test('empty new message causes message to delete', () => {
    // register user
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

    // user1 sends a message
    const messageSend = POST(messageSendPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      message: MESSAGE_VALID
    });

    // use channel/messages/v2 to check
    const messages1 = GET(channelMessagesPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      start: 0
    });
    expect(messages1.statusCode).toBe(OK);
    expect(BODY(messages1).messages[0].message).toBe(MESSAGE_VALID);

    // user1 edits message to '', expect {}
    const edit = PUT(messageEditPATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_EMPTY
    });
    expect(edit.statusCode).toBe(OK);
    expect(BODY(edit)).toStrictEqual(SUCCESS);

    // use channel/messages/v2 to check
    const messages2 = GET(channelMessagesPATH, {
      token: BODY(user1).token,
      channelId: BODY(channel).channelId,
      start: 1
    });
    expect(messages2.statusCode).toBe(BAD_REQUEST);
  });
});

// message/edit/v1 error handling
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

    // call message/edit but with invalid token, expect FORBIDDEN
    const invalidToken = BODY(user1).token + 'lolz';
    const edit = PUT(messageEditPATH, {
      token: invalidToken,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID
    });
    expect(edit.statusCode).toBe(FORBIDDEN);
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

    // call message edit but with invalid messageId, expect BAD_REQUEST
    const invalidMessageId = BODY(messageSend).messageId + 999;
    const edit = PUT(messageEditPATH, {
      token: BODY(user1).token,
      messageId: invalidMessageId,
      message: MESSAGE_VALID
    });
    expect(edit.statusCode).toBe(BAD_REQUEST);
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
    const edit = PUT(messageEditPATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID
    });
    expect(edit.statusCode).toBe(BAD_REQUEST);
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
    const edit = PUT(messageEditPATH, {
      token: BODY(user1).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID
    });
    expect(edit.statusCode).toBe(BAD_REQUEST);
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

    // user2 tries to edit message, expect FORBIDDEN
    const edit = PUT(messageEditPATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_VALID
    });
    expect(edit.statusCode).toBe(FORBIDDEN);
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

    // user3 tries to edit message, expect FORBIDDEN
    const edit = PUT(messageEditPATH, {
      token: BODY(user3).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_NEW_VALID
    });
    expect(edit.statusCode).toBe(FORBIDDEN);
  });

  test('message length > 1000 characters', () => {
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

    // use channel/messages/v2 to check
    const messages1 = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 0
    });
    expect(messages1.statusCode).toBe(OK);
    expect(BODY(messages1).messages[0].message).toBe(MESSAGE_VALID);

    // user2 edits message to MESSAGE_LONG, expect BAD_REQUESTs
    const edit = PUT(messageEditPATH, {
      token: BODY(user2).token,
      messageId: BODY(messageSend).messageId,
      message: MESSAGE_LONG
    });
    expect(edit.statusCode).toBe(BAD_REQUEST);

    // use channel/messages/v2 to check
    const messages2 = GET(channelMessagesPATH, {
      token: BODY(user2).token,
      channelId: BODY(channel).channelId,
      start: 0
    });
    expect(messages2.statusCode).toBe(OK);
    expect(BODY(messages2).messages[0].message).toBe(MESSAGE_VALID);
  });
});
