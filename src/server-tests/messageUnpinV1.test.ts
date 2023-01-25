import { 
  POST, DELETE, BODY,
  clearPATH,
  messageUnpinPATH
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import { 
  registerUser, createChannel, createDm, sendDmMessage, sendMessage, getDmMessage, getMessage, joinChannel, pinMessage
} from './standardOperations';

// ===== STANDARD OUTPUT ===== //
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// ===== STANDARD INPUTS ===== //
const MESSAGE_VALID = 'howdy, hows everyone going';

// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing correct functionality', () => {
  test('channel owner can unpin message', () => {
    // register three users
    const user1 = registerUser(1); // owner
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user2 creates channel
    const channel1 = createChannel(user2.token);

    // user1 and user3 join channel
    joinChannel(user1.token, channel1);
    joinChannel(user3.token, channel1);

    // user1 sends message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user2 pins message
    pinMessage(user2.token, message1);

    // check that dataStore updated
    const before = getMessage(user1.token, channel1)[0];
    expect(before.isPinned).toBe(true);

    // user2 unpins message
    const unpin = POST(messageUnpinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(unpin.statusCode).toBe(OK);
    expect(BODY(unpin)).toStrictEqual({});

    // check that dataStore updated
    const after = getMessage(user1.token, channel1)[0];
    expect(after.isPinned).toBe(false);
  });

  test('dm creator can unpin message', () => {
    // register three users
    const user1 = registerUser(1); // owner
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user2 creates dm to user1 and user3
    const dm1 = createDm(user2.token, [user1.authUserId, user3.authUserId]);

    // user3 sends message to dm
    const message1 = sendDmMessage(user3.token, dm1, MESSAGE_VALID);

    // user2 pins message
    pinMessage(user2.token, message1);

    // check that dataStore updated
    const before = getDmMessage(user1.token, dm1)[0];
    expect(before.isPinned).toBe(true);

    // user2 unpins message
    const unpin = POST(messageUnpinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(unpin.statusCode).toBe(OK);
    expect(BODY(unpin)).toStrictEqual({});

    // check that dataStore updated
    const after = getDmMessage(user1.token, dm1)[0];
    expect(after.isPinned).toBe(false);
  });

  test('global owner can unpin message in channel', () => {
    // register three users
    const user1 = registerUser(1); // owner
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user2 creates channel
    const channel1 = createChannel(user2.token);

    // user1 and user3 join channel
    joinChannel(user1.token, channel1);
    joinChannel(user3.token, channel1);

    // user3 sends message to channel
    const message1 = sendMessage(user3.token, channel1, MESSAGE_VALID);

    // user2 pins message
    pinMessage(user2.token, message1);

    // check that dataStore updated
    const before = getMessage(user1.token, channel1)[0];
    expect(before.isPinned).toBe(true);

    // user2 unpins message
    const unpin = POST(messageUnpinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(unpin.statusCode).toBe(OK);
    expect(BODY(unpin)).toStrictEqual({});

    // check that dataStore updated
    const after = getMessage(user1.token, channel1)[0];
    expect(after.isPinned).toBe(false);
  });
});

describe('testing error handling', () => {
  test('invalid token => FORBIDDEN 403', () => {
    // register a user
    const user1 = registerUser(1);

    // user creates channel
    const channel1 = createChannel(user1.token);

    // user sends message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user pins message
    pinMessage(user1.token, message1);

    // invalid token pins message
    const invalidToken = user1.token + '0';
    const unpin = POST(messageUnpinPATH, {
      token: invalidToken,
      messageId: message1
    });
    expect(unpin.statusCode).toBe(FORBIDDEN);
  });

  test('message is not pinned => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user creats channel
    const channel1 = createChannel(user1.token);

    // user sends message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user pins message
    pinMessage(user1.token, message1);

    // user unpins message => expect OK
    const unpin1 = POST(messageUnpinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(unpin1.statusCode).toBe(OK);
    expect(BODY(unpin1)).toStrictEqual({});

    // user tries to pin message again => expect BAD
    const unpin2 = POST(messageUnpinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(unpin2.statusCode).toBe(BAD_REQUEST);
  });

  test('invalid message id => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user creates channel
    const channel1 = createChannel(user1.token);

    // user send message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user pins message
    pinMessage(user1.token, message1);

    // user tries to pin message but invalid message id => expect BAD
    const invalidMessageId = message1 + 1;
    const pin = POST(messageUnpinPATH, {
      token: user1.token,
      messageId: invalidMessageId
    });
    expect(pin.statusCode).toBe(BAD_REQUEST);
  });

  test('user is not in same channel as message => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates a channel and sends a message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user1 pins message
    pinMessage(user1.token, message1);

    // user2 tries to unpin message => expect BAD
    const unpin = POST(messageUnpinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(unpin.statusCode).toBe(BAD_REQUEST);
  });

  test('user is not in same dm as message => BAD REQUEST 400', () => {
    // register three users
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user1 creates a dm to user2
    const dm1 = createDm(user1.token, [user2.authUserId]);

    // user2 sends a message to dm
    const message1 = sendDmMessage(user2.token, dm1, MESSAGE_VALID);

    // user1 pins the message
    pinMessage(user1.token, message1);

    // user3 tries to pin message => expect BAD
    const unpin = POST(messageUnpinPATH, {
      token: user3.token,
      messageId: message1
    });
    expect(unpin.statusCode).toBe(BAD_REQUEST);
  });

  test('user is in same channel as message but does not have owner permissions => FORBIDDEN 403', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates channel
    const channel1 = createChannel(user1.token);

    // user2 joins channel
    joinChannel(user2.token, channel1);

    // user2 sends message to channel
    const message1 = sendMessage(user2.token, channel1, MESSAGE_VALID);

    // user1 pins the message
    pinMessage(user1.token, message1);

    // user2 tries to unpin message => expect FORBIDDEN
    const unpin = POST(messageUnpinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(unpin.statusCode).toBe(FORBIDDEN);
  });

  test('user is in same dm as message but does not have owner permissions => FORBIDDEN 403', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user2 creates dm to user1
    const dm1 = createDm(user2.token, [user1.authUserId]);

    // user1 sends message to dm
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);

    // user2 pins message
    pinMessage(user2.token, message1);

    // user1 tries to unpin message => expect FORBIDDEN
    const pin = POST(messageUnpinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(FORBIDDEN);
  });
});