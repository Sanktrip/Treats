import {
  POST, DELETE, BODY, GET,
  clearPATH, searchPATH, messageSendDmPATH
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
const QUERY_VALID = 'everyone';
const QUERY_INVALID = '';
const MESSAGE_VALID = 'howdy, hows everyone going';
let QUERY_INVALID2 = 'a';
for (let i = 0; i < 1000; i++) {
  QUERY_INVALID2 += 'a';
}
const QUERY_VALID2 = 'a';
for (let i = 0; i < 999; i++) {
  QUERY_INVALID2 += 'a';
}
// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing correct functionality', () => {
  test('Standard inputs', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);
    const dm1 = createDm(user1.token, [user2.authUserId]);
    const dmMessage1 = POST(messageSendDmPATH, {
      token: user1.token,
      dmId: dm1,
      message: MESSAGE_VALID,
    });
    // user reacts to message
    const query = GET(searchPATH, {
      token: user1.token,
      queryStr: QUERY_VALID,
    });
    expect(query.statusCode).toBe(OK);
    expect(BODY(query).messages).toStrictEqual([{
      isPinned: false,
      message: 'howdy, hows everyone going',
      messageId: 1,
      reacts: [],
      timeSent: expect.any(Number),
      uId: 1,
    },
    {
      isPinned: false,
      message: 'howdy, hows everyone going',
      messageId: 2,
      reacts: [],
      timeSent: expect.any(Number),
      uId: 1,
    }]);
  });
});

test('Query length = 0', () => {
  // register a user
  const user1 = registerUser(1);

  // user1 creates a channel + sends message
  const channel1 = createChannel(user1.token);
  const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

  // user reacts to message
  const query = GET(searchPATH, {
    token: user1.token,
    queryStr: QUERY_INVALID,
  });
  expect(query.statusCode).toBe(BAD_REQUEST);
});

test('Query length = 1001', () => {
  // register a user
  const user1 = registerUser(1);

  // user1 creates a channel + sends message
  const channel1 = createChannel(user1.token);
  const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

  // user reacts to message
  const query = GET(searchPATH, {
    token: user1.token,
    queryStr: QUERY_INVALID2,
  });
  expect(query.statusCode).toBe(BAD_REQUEST);
});

test('Edge case: Query length = 1000', () => {
  // register a user
  const user1 = registerUser(1);

  // user1 creates a channel + sends message
  const channel1 = createChannel(user1.token);
  const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

  // user reacts to message
  const query = GET(searchPATH, {
    token: user1.token,
    queryStr: QUERY_VALID2,
  });
  expect(query.statusCode).toBe(OK);
  expect(BODY(query).messages).toStrictEqual([]);
});

test('Invalid token', () => {
  // register a user
  const user1 = registerUser(1);

  // user1 creates a channel + sends message
  const channel1 = createChannel(user1.token);
  const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);

  // user reacts to message
  const query = GET(searchPATH, {
    token: user1.token + 5,
    queryStr: QUERY_VALID,
  });
  expect(query.statusCode).toBe(FORBIDDEN);
});
