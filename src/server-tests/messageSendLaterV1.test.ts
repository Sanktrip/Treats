import { 
  POST, DELETE, BODY,
  clearPATH,
  messageSendLaterPATH, 
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import { 
  registerUser, createChannel, createDm, sendDmMessage, sendMessage, getDmMessage, getMessage, joinChannel, sendLater
} from './standardOperations';

// ===== STANDARD OUTPUT ===== //
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// ===== STANDARD INPUTS ===== //
const MESSAGE_VALID = 'howdy, hows everyone going';
const MESSAGE_VALID_1 = 'the kinderlumber\'s gonna get ya, he\'s gonna get you good';

const standardDelay = 0.5;

// ===== HELPER FUNCTION ===== //
// returns current unix time
function getTimestamp(): number {
  return Date.parse(new Date().toISOString()) / 1000;
}

// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});


describe('testing correct functionality', () => {
  jest.setTimeout(5*60*1000);
  test('Message is not shown before timeSent', () => {
    // register users
    const user1 = registerUser(1); // owner
    const user2 = registerUser(2);
    
    // user2 creates channel
    const channel1 = createChannel(user2.token);
    
    // user1 join channel
    joinChannel(user1.token, channel1);
    
    // user1 sends message to channel
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);
    
    let timeSent = getTimestamp() + standardDelay;
    // user2 sends message later
    const laterMessage = POST(messageSendLaterPATH, {
      token: user2.token,
      channelId: channel1,
      message: MESSAGE_VALID_1,
      timeSent: timeSent
    });
    expect(laterMessage.statusCode).toBe(OK);
    expect(BODY(laterMessage)).toStrictEqual({
      messageId: expect.any(Number)
    });

    // check the delayed message doesn't show up
    let message = getMessage(user1.token, channel1);
    expect(message.length).toStrictEqual(1);
    expect(message[0].message).toStrictEqual(MESSAGE_VALID);

    // check that the delayed message does show up

    while (getTimestamp() < timeSent) { }

    message = getMessage(user1.token, channel1);
    expect(message.length).toStrictEqual(2);
    expect(message[0].message).toStrictEqual(MESSAGE_VALID_1);
    expect(message[0].messageId).toBe(BODY(laterMessage).messageId);
    expect(message[1].message).toStrictEqual(MESSAGE_VALID);
    expect(message[1].messageId).toBe(message1);
  });
});

describe('testing error handling', () => {
  test('invalid channelId => BAD REQUEST 400', () => {
    
    let timeSent = getTimestamp() + 3;

    // register users
    const user1 = registerUser(3); // owner
    const user2 = registerUser(4);

    // user2 creates channel
    const channel1 = createChannel(user2.token);

    // user1 join channel
    joinChannel(user1.token, channel1);

    // user2 sends message later with bad channelId
    const laterMessage = POST(messageSendLaterPATH, {
      token: user2.token,
      channelId: "5",
      message: MESSAGE_VALID_1,
      timeSent: timeSent
    });
    expect(laterMessage.statusCode).toBe(BAD_REQUEST);
  });
  test('length of message not between 1 and 1000 characters (inclusive) => BAD REQUEST 400', () => {
    
    let timeSent = getTimestamp() + 3;

    // register users
    const user1 = registerUser(5); // owner
    const user2 = registerUser(6);

    // user2 creates channel
    const channel1 = createChannel(user2.token);

    // user1 join channel
    joinChannel(user1.token, channel1);

    // user2 sends message later with no message
    const laterMessage1 = POST(messageSendLaterPATH, {
      token: user2.token,
      channelId: channel1,
      message: '',
      timeSent: timeSent
    });

    //generage mesage > 1000 characters
    let longMessage = "long_Message "
    for (let i = 0; i < 10; i++) {
      longMessage = longMessage + longMessage;
    }

    // user2 sends message later with message > 1000 characters
    const laterMessage2 = POST(messageSendLaterPATH, {
      token: user2.token,
      channelId: channel1,
      message: longMessage,
      timeSent: timeSent
    });
    expect(laterMessage1.statusCode).toBe(BAD_REQUEST);
    expect(laterMessage2.statusCode).toBe(BAD_REQUEST);
  });

  test('timeSent is in the past => BAD REQUEST 400', () => {
    
    let timeSent = getTimestamp() - 3;

    // register users
    const user1 = registerUser(7); // owner
    const user2 = registerUser(8);

    // user2 creates channel
    const channel1 = createChannel(user2.token);

    // user1 join channel
    joinChannel(user1.token, channel1);

    // user2 sends message later with timeSent being in the past
    const laterMessage = POST(messageSendLaterPATH, {
      token: user2.token,
      channelId: channel1,
      message: MESSAGE_VALID_1,
      timeSent: timeSent - 10
    });
    expect(laterMessage.statusCode).toBe(BAD_REQUEST);
  });

  test('User not member of channel => FORBIDDEN 403', () => {
    
    let timeSent = getTimestamp() + 3;

    // register users
    const user1 = registerUser(9); // owner
    const user2 = registerUser(10);
    const user3 = registerUser(11);

    // user2 creates channel
    const channel1 = createChannel(user2.token);

    // user1 join channel
    joinChannel(user1.token, channel1);

    // user3 sends message later but is not member
    const laterMessage = POST(messageSendLaterPATH, {
      token: user3.token,
      channelId: channel1,
      message: MESSAGE_VALID_1,
      timeSent: timeSent
    });
    expect(laterMessage.statusCode).toBe(FORBIDDEN);
  });
});
