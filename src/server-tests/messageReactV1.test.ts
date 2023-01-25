import { 
  POST, DELETE, BODY,
  clearPATH, messageReactPATH
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import { 
    registerUser, createChannel, createDm, sendDmMessage, sendMessage, getDmMessage, getMessage
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
  test('react to a channel message => OK 200 + correct output + functionality', () => {
    // register a user
    const user1 = registerUser(1);    

    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user reacts to message
    const react1 = POST(messageReactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react1.statusCode).toBe(OK);
    expect(BODY(react1)).toStrictEqual({});

    // check that dataStore is updated
    const reaction = getMessage(user1.token, channel1)[0].reacts[0];
    expect(reaction).toStrictEqual({
      reactId: REACT_ID_VALID,
      uIds: [ user1.authUserId ],
      isThisUserReacted: true
    });
  });
  test('react to a dm message => OK 200 + correct output + functionality', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates a dm to user2 + sends message
    const dm1 = createDm(user1.token, [ user2.authUserId ]);
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);

    // user2 reacts to message
    const react1 = POST(messageReactPATH, {
      token: user2.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react1.statusCode).toBe(OK);
    expect(BODY(react1)).toStrictEqual({});

    // user1 reacts to message
    const react2 = POST(messageReactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react2.statusCode).toBe(OK);
    expect(BODY(react2)).toStrictEqual({});

    // check that dataStore is updated
    const reaction = getDmMessage(user1.token, dm1)[0].reacts[0];
    reaction.uIds = new Set(reaction.uIds);
    expect(reaction).toStrictEqual({
      reactId: REACT_ID_VALID,
      uIds: new Set([ user1.authUserId, user2.authUserId ]),
      isThisUserReacted: true
    });
  });
});

describe('testing correct error handling', () => {
  test('invalid token => FORBIDDEN 403', () => {
    // register a user
    const user1 = registerUser(1);

    // user creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);
    
    // invalid token reacts to message
    const invalidToken = user1.token + '0';
    const react = POST(messageReactPATH, {
      token: invalidToken,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react.statusCode).toBe(FORBIDDEN);
  });

  test('invalid messageId => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user tries to react to message but invalid message id
    const invalidMessageId = message1 + 1;
    const react = POST(messageReactPATH, {
      token: user1.token,
      messageId: invalidMessageId,
      reactId: REACT_ID_VALID
    });
    expect(react.statusCode).toBe(BAD_REQUEST);
  });

  test('message is not in same channel as user => BAD REQUEST 400', () => {
    // register two users
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates a channel + sends message to channel
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user2 tries to react to message
    const react = POST(messageReactPATH, {
      token: user2.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react.statusCode).toBe(BAD_REQUEST);
  });

  test('message is not in same dm as user => BAD REQUEST 400', () => {
    // register three users
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    // user1 creates a dm to user2 + sends message to user2
    const dm1 = createDm(user1.token, [ user2.authUserId ]);
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);

    // user3 tries to react to message
    const react = POST(messageReactPATH, {
      token: user3.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react.statusCode).toBe(BAD_REQUEST);
  });

  test('invalid react id => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);

    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user tries to react with invalid react id
    const react = POST(messageReactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_INVALID
    });
    expect(react.statusCode).toBe(BAD_REQUEST);
  });

  test('the user has already reacted to the same message with the same message before => BAD REQUEST 400', () => {
    // register a user
    const user1 = registerUser(1);    

    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

    // user reacts to message
    const react1 = POST(messageReactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react1.statusCode).toBe(OK);

    // user tries to react to message again => ERROR
    const react2 = POST(messageReactPATH, {
      token: user1.token,
      messageId: message1,
      reactId: REACT_ID_VALID
    });
    expect(react2.statusCode).toBe(BAD_REQUEST);
  });
});
