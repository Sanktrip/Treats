import { 
  POST, DELETE, BODY,
  clearPATH, messageUnreactPATH
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import { 
    registerUser, createChannel, leaveChannel, joinChannel, createDm, sendDmMessage, sendMessage, getDmMessage, getMessage, reactMessage, leaveDm
} from './standardOperations';

// ===== STANDARD OUTPUT ===== //
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// ===== STANDARD INPUTS ===== //
const REACT_ID_VALID = 1;
const REACT_ID_INVALID = 2;

const MESSAGE_VALID = 'howdy, hows everyone going';

// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing correct functionality', () => {
  test('unreact to a channel message => OK 200 + correct output + functionality', () => {
    // register a user
    const user1 = registerUser(1);

    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user reacts to message
    reactMessage(user1.token, message1, REACT_ID_VALID);

    // check that dataStore is updated
    const reacts1 = getMessage(user1.token, channel1)[0].reacts;
    expect(reacts1).toStrictEqual([{
      reactId: REACT_ID_VALID,
      uIds: [user1.authUserId],
      isThisUserReacted: true
    }]);

    // user unreacts to message
    const unreact = POST(messageUnreactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact.statusCode).toBe(OK);
    expect(BODY(unreact)).toStrictEqual({});

    // check that the dataStore is updated
    const reacts2 = getMessage(user1.token, channel1)[0].reacts;
    expect(reacts2).toStrictEqual([]);
  });

  test('react to a dm message => OK 200 + correct output + functionality', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates a dm to user2 + sends message
    const dm1 = createDm(user1.token, [user2.authUserId]);
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);

    // user2 + user1 reacts to message
    reactMessage(user2.token, message1, REACT_ID_VALID);
    reactMessage(user1.token, message1, REACT_ID_VALID);

    // check that dataStore is updated
    const reacts1 = getDmMessage(user1.token, dm1)[0].reacts;

    reacts1[0].uIds = new Set(reacts1[0].uIds);
    expect(reacts1).toStrictEqual([{
      reactId: REACT_ID_VALID,
      uIds: new Set([user1.authUserId, user2.authUserId]),
      isThisUserReacted: true
    }]);

    // user2 unreacts to message
    const unreact1 = POST(messageUnreactPATH, {
      token: user2.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact1.statusCode).toBe(OK);
    expect(BODY(unreact1)).toStrictEqual({});

    // check that dataStore is updated
    const reacts2 = getDmMessage(user2.token, dm1)[0].reacts;
    expect(reacts2).toStrictEqual([{
      reactId: REACT_ID_VALID,
      uIds: [user1.authUserId],
      isThisUserReacted: false
    }]);

    // user1 unreacts to message
    const unreact2 = POST(messageUnreactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact2.statusCode).toBe(OK);
    expect(BODY(unreact2)).toStrictEqual({});

    // check that dataStore is updated
    const reacts3 = getDmMessage(user2.token, dm1)[0].reacts;
    expect(reacts3).toStrictEqual([]);
  });
});

describe('testing correct error handling', () => {
  test('invalid token => FORBIDDEN 403', () => {
    // register a user
    const user1 = registerUser(1);

    // user creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);
    
    // user reacts to message
    reactMessage(user1.token, message1, REACT_ID_VALID);

    // invalid token unreacts to message
    const invalidToken = user1.token + '0';
    const unreact1 = POST(messageUnreactPATH, {
      token: invalidToken,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact1.statusCode).toBe(FORBIDDEN);
  });

  test('invalid messageId => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user reacts to message
    reactMessage(user1.token, message1, REACT_ID_VALID);

    // user tries to unreact to message but invalid message id
    const invalidMessageId = message1 + 1;
    const unreact = POST(messageUnreactPATH, {
      token: user1.token,
      messageId: invalidMessageId,
      reactId: REACT_ID_VALID
    });
    expect(unreact.statusCode).toBe(BAD_REQUEST);
  });

  test('message is not in same channel as user => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates a channel + sends message to channel
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user2 joins channel1
    joinChannel(user2.token, channel1);

    // user2 reacts to message1
    reactMessage(user2.token, message1, REACT_ID_VALID);

    // user2 leaves channel
    leaveChannel(user2.token, channel1);

    // user2 tries to unreact to message
    const unreact = POST(messageUnreactPATH, {
      token: user2.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact.statusCode).toBe(BAD_REQUEST);
  });

  test('message is not in same dm as user => BAD REQUEST 400', () => {
    // register three users
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user1 creates a dm to user2 + sends message to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);

    // user 2 reacts to message
    reactMessage(user2.token, message1, REACT_ID_VALID);

    // user2 leaves dm
    leaveDm(user2.token, dm1);

    // user2 tries to unreact to message
    const unreact = POST(messageUnreactPATH, {
      token: user3.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact.statusCode).toBe(BAD_REQUEST);
  });

  test('invalid react id => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user1 reacts to message
    reactMessage(user1.token, message1, REACT_ID_VALID);

    // user1 tries to unreact with invalid react id
    const unreact = POST(messageUnreactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_INVALID
    });
    expect(unreact.statusCode).toBe(BAD_REQUEST);
  });

  test('no react to unreact => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user2 joins channel
    joinChannel(user2.token, channel1);

    // user1 reacts to message
    reactMessage(user1.token, message1, REACT_ID_VALID);

    // user2 tries to unreact to message => ERROR
    const unreact1 = POST(messageUnreactPATH, {
      token: user2.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact1.statusCode).toBe(BAD_REQUEST);

    // user1 unreacts to message => OK
    const unreact2 = POST(messageUnreactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact2.statusCode).toBe(OK);

    // user1 tries to unreact to message again => ERROR
    const unreact3 = POST(messageUnreactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(unreact3.statusCode).toBe(BAD_REQUEST);
  });
});
