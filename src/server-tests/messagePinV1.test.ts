import { 
  POST, DELETE, BODY,
  clearPATH,
  messagePinPATH, 
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import { 
  registerUser, createChannel, createDm, sendDmMessage, sendMessage, getDmMessage, getMessage, joinChannel
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
  test('channel owner can pin message', () => {
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
    const pin = POST(messagePinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(OK);
    expect(BODY(pin)).toStrictEqual({});

    // check that dataStore updated
    const message = getMessage(user1.token, channel1)[0];
    expect(message.isPinned).toBe(true);
  });

  test('dm creator can pin message', () => {
    // register three users
    const user1 = registerUser(1); // owner
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user2 creates dm to user1 and user3
    const dm1 = createDm(user2.token, [user1.authUserId, user3.authUserId]);

    // user3 sends message to dm
    const message1 = sendDmMessage(user3.token, dm1, MESSAGE_VALID);

    // user2 pins message
    const pin = POST(messagePinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(OK);
    expect(BODY(pin)).toStrictEqual({});

    // check that dataStore updated
    const message = getDmMessage(user1.token, dm1)[0];
    expect(message.isPinned).toBe(true);
  });

  test('global owner can pin message in channel', () => {
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

    // user1 pins message
    const pin = POST(messagePinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(OK);
    expect(BODY(pin)).toStrictEqual({});

    // check that dataStore updated
    const message = getMessage(user1.token, channel1)[0];
    expect(message.isPinned).toBe(true);
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

    // invalid token pins message
    const invalidToken = user1.token + '0';
    const pin = POST(messagePinPATH, {
      token: invalidToken,
      messageId: message1
    });
    expect(pin.statusCode).toBe(FORBIDDEN);
  });

  test('message is already pinned => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user creats channel
    const channel1 = createChannel(user1.token);

    // user sends message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user pins message => expect OK
    const pin1 = POST(messagePinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(pin1.statusCode).toBe(OK);
    expect(BODY(pin1)).toStrictEqual({});

    // user tries to pin message again => expect BAD
    const pin2 = POST(messagePinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(pin2.statusCode).toBe(BAD_REQUEST);
  });

  test('invalid message id => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user creates channel
    const channel1 = createChannel(user1.token);

    // user send message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user tries to pin message but invalid message id => expect BAD
    const invalidMessageId = message1 + 1;
    const pin = POST(messagePinPATH, {
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

    // user2 tries to pin message => expect BAD
    const pin = POST(messagePinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(BAD_REQUEST);
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

    // user3 tries to pin message => expect BAD
    const pin = POST(messagePinPATH, {
      token: user3.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(BAD_REQUEST);
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

    // user2 tries to pin message => expect FORBIDDEN
    const pin = POST(messagePinPATH, {
      token: user2.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(FORBIDDEN);
  });

  test('user is in same dm as message but does not have owner permissions => FORBIDDEN 403', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user2 creates dm to user1
    const dm1 = createDm(user2.token, [user1.authUserId]);

    // user1 sends message to dm
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);

    // user1 tries to pin message => expect FORBIDDEN
    const pin = POST(messagePinPATH, {
      token: user1.token,
      messageId: message1
    });
    expect(pin.statusCode).toBe(FORBIDDEN);
  });
});