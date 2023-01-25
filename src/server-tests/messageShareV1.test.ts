import { 
  POST, DELETE, BODY,
  clearPATH, messageSharePATH
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import { 
  registerUser, createChannel, createDm, joinChannel, sendDmMessage, sendMessage, getDmMessage, getMessage
} from './standardOperations';

// ===== STANDARD OUTPUT ===== //
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// ===== STANDARD INPUTS ===== //
const NOT = -1;

const MESSAGE_VALID = 'howdy, hows everyone going';
const MESSAGE_NEW_VALID = 'hows the weather down there :))))';
const MESSAGE_LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam condimentum nibh in porta dignissim. Sed elit lectus, vestibulum eget porttitor luctus, ullamcorper ac dolor. Suspendisse potenti. In hac habitasse platea dictumst. Aenean nulla tortor, maximus ac dui a, rutrum congue ex. Aliquam et consectetur nunc. Aenean a est leo. Donec ex justo, laoreet ut libero at, rhoncus mattis neque. Donec tellus tellus, convallis in rhoncus ut, ullamcorper id arcu. Cras eget lectus non sem congue pulvinar vel quis nulla. Pellentesque et pulvinar odio. Donec fringilla massa ac turpis porta, et viverra purus rhoncus. Nam ornare magna sit amet arcu convallis, at varius lorem dignissim. Curabitur maximus in tellus in pharetra. Phasellus interdum condimentum tellus, vitae suscipit massa. Proin eu tortor tincidunt, maximus augue sit amet, laoreet ipsum. Suspendisse potenti. Donec imperdiet eros ac lorem vestibulum scelerisque ut vehicula felis. Praesent quis lorem odio. Cras consectetur nunc in urna venenatis laoreet. Fusce non consectetur dolor, efficitur bibendum lorem.';

// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing correct functionality', () => {
  test('share message from channel to other channel => OK 200 + correct return type', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 and uer2 each create a channel
    const channel1 = createChannel(user1.token);
    const channel2 = createChannel(user2.token);

    // user1 joins user2 channel
    joinChannel(user1.token, channel2);

    // user2 sends message to channel2
    const message1 = sendMessage(user2.token, channel2, MESSAGE_VALID);

    // user1 shares the message to channel1
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: channel1,
      dmId: NOT
    });
    expect(share.statusCode).toBe(OK);
    expect(BODY(share)).toStrictEqual({
      sharedMessageId: expect.any(Number)
    });

    // check that the message is sent
    const sharedMessage = getMessage(user1.token, channel1)[0].message;
    expect(sharedMessage.includes(MESSAGE_VALID)).toBe(true);
    expect(sharedMessage.includes(MESSAGE_NEW_VALID)).toBe(true);

    // check that the original message is unchanged
    const ogMessage = getMessage(user1.token, channel2)[0].message;
    expect(ogMessage).toBe(MESSAGE_VALID);
  });

  test('share message from channel to dm => OK 200 + correct return type', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // user2 joins channel
    joinChannel(user2.token, channel1);

    // create dm from user1 to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // user2 send message to channel
    const message1 = sendMessage(user2.token, channel1, MESSAGE_VALID);

    // user1 shares message wth dm1
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: NOT,
      dmId: dm1
    });
    expect(share.statusCode).toBe(OK);
    expect(BODY(share)).toStrictEqual({
      sharedMessageId: expect.any(Number)
    });

    // check that message is sent
    const sharedMessage = getDmMessage(user1.token, dm1)[0].message;
    expect(sharedMessage.includes(MESSAGE_VALID)).toBe(true);
    expect(sharedMessage.includes(MESSAGE_NEW_VALID)).toBe(true);

    // check that the original message is unchanged
    const ogMessage = getMessage(user1.token, channel1)[0].message;
    expect(ogMessage).toBe(MESSAGE_VALID);
  });

  test('share message from dm to other dm => OK 200 + correct return type', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates dm
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // create dm from user1 to user2
    const dm2 = createDm(user1.token, [ user2.authUserId ]);

    // user2 send message to dm1
    const message1 = sendDmMessage(user2.token, dm1, MESSAGE_VALID);

    // user1 tries to share message to dm2 with message length > 1000 => expect 400
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: NOT,
      dmId: dm2
    });
    expect(share.statusCode).toBe(OK);
    expect(BODY(share)).toStrictEqual({
      sharedMessageId: expect.any(Number)
    });

    // check that message is sent
    const sharedMessage = getDmMessage(user1.token, dm2)[0].message;
    expect(sharedMessage.includes(MESSAGE_VALID)).toBe(true);
    expect(sharedMessage.includes(MESSAGE_NEW_VALID)).toBe(true);

    // check that the original message is unchanged
    const ogMessage = getDmMessage(user1.token, dm1)[0].message;
    expect(ogMessage).toBe(MESSAGE_VALID);
  });

  test('share message from dm to channel => OK 200 + correct return type', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates dm to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // user 1 creates channel
    const channel1 = createChannel(user1.token);

    // user2 send message to dm1
    const message1 = sendDmMessage(user2.token, dm1, MESSAGE_VALID);

    // user1 tries to share message to channel1 
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: channel1,
      dmId: NOT
    });
    expect(share.statusCode).toBe(OK);
    expect(BODY(share)).toStrictEqual({
      sharedMessageId: expect.any(Number)
    });

    // check that message is sent
    const sharedMessage = getMessage(user1.token, channel1)[0].message;
    expect(sharedMessage.includes(MESSAGE_VALID)).toBe(true);
    expect(sharedMessage.includes(MESSAGE_NEW_VALID)).toBe(true);

    // check that the original message is unchanged
    const ogMessage = getDmMessage(user1.token, dm1)[0].message;
    expect(ogMessage).toBe(MESSAGE_VALID);
  });

  test('message is not given (i.e., new message is empty) => OK 200 + correct return type', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 and uer2 each create a channel
    const channel1 = createChannel(user1.token);
    const channel2 = createChannel(user2.token);

    // user1 joins user2 channel
    joinChannel(user1.token, channel2);

    // user2 sends message to channel2
    const message1 = sendMessage(user2.token, channel2, MESSAGE_VALID);

    // user1 shares the message to channel1
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      channelId: channel1,
      dmId: NOT
    });
    expect(share.statusCode).toBe(OK);
    expect(BODY(share)).toStrictEqual({
      sharedMessageId: expect.any(Number)
    });

    // check that the message is sent
    const sharedMessage = getMessage(user1.token, channel1)[0].message;
    expect(sharedMessage.includes(MESSAGE_VALID)).toBe(true);

    // check that the original message is unchanged
    const ogMessage = getMessage(user1.token, channel2)[0].message;
    expect(ogMessage).toBe(MESSAGE_VALID);
  });
});

describe('testing correct error handling', () => {
  test('invalid token => FORBIDDEN 403', () => {
    // register user
    const user1 = registerUser(1);

    // call message/share => expect 403
    const invalidToken = user1.token + '0';
    const share = POST(messageSharePATH, {
      token: invalidToken,
      ogMessageId: 1,
      message: MESSAGE_VALID,
      channelId: 1,
      dmId: 1,
    });
    expect(share.statusCode).toBe(FORBIDDEN);
  });

  test('invalid channelId and dmId => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // create dm from user1 to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // send message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // try to share message with invalid ids => expect 400
    const invalidChannelId = channel1 + 1;
    const share1 = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: invalidChannelId,
      dmId: NOT
    });
    expect(share1.statusCode).toBe(BAD_REQUEST);

    const invalidDmId = dm1 + 1;
    const share2 = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: NOT,
      dmId: invalidDmId
    });
    expect(share2.statusCode).toBe(BAD_REQUEST);

    const share3 = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: invalidChannelId,
      dmId: invalidDmId
    });
    expect(share3.statusCode).toBe(BAD_REQUEST);
  });

  test('neither channelId and dmId are -1 => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user 1 creates channel
    const channel1 = createChannel(user1.token);

    // create dm from user1 to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // send message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // try to share message to both channelId and dmId => expect 400
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: channel1,
      dmId: dm1
    });
    expect(share.statusCode).toBe(BAD_REQUEST);
  });

  test('invalid ogMessageId => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user 1 creates channel
    const channel1 = createChannel(user1.token);

    // create dm from user1 to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // send message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // try to share invalid message id to channelId and dmId => expect 400
    const invalidMessageId = message1 + 1;
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: invalidMessageId,
      message: MESSAGE_NEW_VALID,
      channelId: NOT,
      dmId: dm1
    });
    expect(share.statusCode).toBe(BAD_REQUEST);
  });

  test('auth user is not in same channel as ogMessageId => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // create dm from user1 to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // user1 send message in channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user2 tries to share message from channel to dm => expect 400
    const share = POST(messageSharePATH, {
      token: user2.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: NOT,
      dmId: dm1
    });
    expect(share.statusCode).toBe(BAD_REQUEST);
  });

  test('auth user is not in same dm as ogMessageId => BAD REQUEST 400', () => {
    // register three users
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // create dm from user2 to user3
    const dm1 = createDm(user2.token, [ user3.authUserId ]);

    // user2 send message in dm
    const message1 = sendDmMessage(user2.token, dm1, MESSAGE_VALID);

    // user1 tries to share message => expect 400
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: channel1,
      dmId: NOT
    });
    expect(share.statusCode).toBe(BAD_REQUEST);
  });

  test('message length > 1000 characters => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // user2 joins channel
    joinChannel(user2.token, channel1);

    // create dm from user1 to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // user2 send message to channel
    const message1 = sendMessage(user2.token, channel1, MESSAGE_VALID);

    // user1 tries to share message to dm with message length > 1000 => expect 400
    const share = POST(messageSharePATH, {
      token: user1.token,
      ogMessageId: message1,
      message: MESSAGE_LONG,
      channelId: NOT,
      dmId: dm1
    });
    expect(share.statusCode).toBe(BAD_REQUEST);
  });

  test('auth user is not in channel of channelId => FORBIDDEN 403', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // user1 creates dm to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // user1 sends a message to dm
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);

    // user2 tries to share the message to the channel => expect 403
    const share = POST(messageSharePATH, {
      token: user2.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: channel1,
      dmId: NOT
    });
    expect(share.statusCode).toBe(FORBIDDEN);
  });

  test('auth user is not in dm of dmId => FORBIDDEN 403', () => {
    // register three users
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // user3 joins channel
    joinChannel(user3.token, channel1);

    // user1 creates dm to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);

    // user1 sends a message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user3 tries to share the message to the dm => expect 403
    const share = POST(messageSharePATH, {
      token: user3.token,
      ogMessageId: message1,
      message: MESSAGE_NEW_VALID,
      channelId: NOT,
      dmId: dm1
    });
    expect(share.statusCode).toBe(FORBIDDEN);
  });
});
