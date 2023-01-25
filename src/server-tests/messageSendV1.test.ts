// @ts-nocheck

import { GET, DELETE, POST, BODY } from './httpRequestsV1';
import { authRegisterPATH, clearPATH, messageSendPATH, channelsCreatePATH, channelMessagesPATH, channelJoinPATH } from './httpRequestsV1';

// result constants
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

/**
 * messagesSend takes in
 * token, channelId, message
 * returns: messageId
 *
 * Types of tests:
 *
 * 1. General tests for expected usage
 * 2. Invalid parameters and error checking
 *
 *
*/

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('1. General Usage Tests', () => {
  test('1.5. Five users, two channels', () => {
    let user1 = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user1 = BODY(user1);
    let user2 = POST(authRegisterPATH, {
      email: 'anotheremail@yahoo.com',
      password: 'letters67',
      nameFirst: 'Bill',
      nameLast: 'Harvey',
    });
    user2 = BODY(user2);
    let user3 = POST(authRegisterPATH, {
      email: 'aperson@outlook.com',
      password: 'qwerty',
      nameFirst: 'Bob',
      nameLast: 'Marley',
    });
    user3 = BODY(user3);
    let user4 = POST(authRegisterPATH, {
      email: 'student@unsw.com',
      password: 'zxcvbb',
      nameFirst: 'Sam',
      nameLast: 'Foo',
    });
    user4 = BODY(user4);
    let user5 = POST(authRegisterPATH, {
      email: 'maybe@gmail.com',
      password: 'asdfdsfsdfg',
      nameFirst: 'Water',
      nameLast: 'Fire',
    });
    user5 = BODY(user5);

    let channel1 = POST(channelsCreatePATH, {
      token: user1.token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel1 = BODY(channel1);
    let channel2 = POST(channelsCreatePATH, {
      token: user2.token,
      name: 'Test 2 Channel',
      isPublic: true,
    });
    channel2 = BODY(channel2);

    POST(channelJoinPATH, { token: user5.token, channelId: channel2.channelId });
    POST(channelJoinPATH, { token: user3.token, channelId: channel1.channelId });
    POST(channelJoinPATH, { token: user4.token, channelId: channel2.channelId });
    POST(channelJoinPATH, { token: user4.token, channelId: channel1.channelId });
    POST(channelJoinPATH, { token: user2.token, channelId: channel1.channelId });

    const message1 = POST(messageSendPATH, {
      token: user2.token,
      channelId: channel2.channelId,
      message: 'Test message 1.5.1',
    });
    const message2 = POST(messageSendPATH, {
      token: user1.token,
      channelId: channel1.channelId,
      message: 'Test message 1.5.2',
    });
    const message3 = POST(messageSendPATH, {
      token: user3.token,
      channelId: channel1.channelId,
      message: 'Test message 1.5.3',
    });
    const message4 = POST(messageSendPATH, {
      token: user2.token,
      channelId: channel2.channelId,
      message: 'Test message 1.5.4',
    });
    const message5 = POST(messageSendPATH, {
      token: user4.token,
      channelId: channel2.channelId,
      message: 'Test message 1.5.5',
    });
    const message6 = POST(messageSendPATH, {
      token: user5.token,
      channelId: channel2.channelId,
      message: 'Test message 1.5.6',
    });
    const message7 = POST(messageSendPATH, {
      token: user3.token,
      channelId: channel1.channelId,
      message: 'Test message 1.5.7',
    });
    const message8 = POST(messageSendPATH, {
      token: user2.token,
      channelId: channel1.channelId,
      message: 'Test message 1.5.8',
    });
    const message9 = POST(messageSendPATH, {
      token: user4.token,
      channelId: channel2.channelId,
      message: 'Test message 1.5.9',
    });
    const message10 = POST(messageSendPATH, {
      token: user4.token,
      channelId: channel1.channelId,
      message: 'Test message 1.5.10',
    });

    const channelMsgs1 = GET(channelMessagesPATH, {
      token: user1.token,
      channelId: channel1.channelId,
      start: 0,
    });
    const channelMsgs2 = GET(channelMessagesPATH, {
      token: user2.token,
      channelId: channel2.channelId,
      start: 0,
    });

    expect(BODY(channelMsgs1).messages).toStrictEqual([
      {
        messageId: BODY(message10).messageId,
        message: 'Test message 1.5.10',
        uId: user4.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message8).messageId,
        message: 'Test message 1.5.8',
        uId: user2.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message7).messageId,
        message: 'Test message 1.5.7',
        uId: user3.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message3).messageId,
        message: 'Test message 1.5.3',
        uId: user3.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message2).messageId,
        message: 'Test message 1.5.2',
        uId: user1.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
    ]);
    expect(BODY(channelMsgs2).messages).toStrictEqual([
      {
        messageId: BODY(message9).messageId,
        message: 'Test message 1.5.9',
        uId: user4.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message6).messageId,
        message: 'Test message 1.5.6',
        uId: user5.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message5).messageId,
        message: 'Test message 1.5.5',
        uId: user4.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message4).messageId,
        message: 'Test message 1.5.4',
        uId: user2.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message1).messageId,
        message: 'Test message 1.5.1',
        uId: user2.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
    ]);
  });
});

describe('2. Error checking', () => {
  test('2.1. Sending a zero length message', () => {
    let user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user = BODY(user);

    let channel = POST(channelsCreatePATH, {
      token: user.token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    const message = POST(messageSendPATH, {
      token: user.token,
      channelId: channel.channelId,
      message: '',
    });
    expect(message.statusCode).toBe(BAD_REQUEST);

    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs).messages).toStrictEqual([]);
  });
  test('2.2. Sending a message with " " only', () => {
    let user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user = BODY(user);

    let channel = POST(channelsCreatePATH, {
      token: user.token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    const message = POST(messageSendPATH, {
      token: user.token,
      channelId: channel.channelId,
      message: ' ',
    });
    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs).messages).toStrictEqual([{
      messageId: 1,
      message: ' ',
      uId: user.authUserId,
      timeSent: expect.any(Number),
      isPinned: false,
      reacts: [],
    }]);
  });
  test('2.3. Sending message length > 1000', () => {
    let user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user = BODY(user);

    let channel = POST(channelsCreatePATH, {
      token: user.token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    let testMessage = 'Repeated phrase...';
    for (let i = 0; i < (Math.floor(5000/testMessage.length) + 1); i++) {
      testMessage += testMessage;
    }
    expect(testMessage.length).toBeGreaterThan(1000);

    const message = POST(messageSendPATH, {
      token: user.token,
      channelId: channel.channelId,
      message: testMessage,
    });
    expect(message.statusCode).toBe(BAD_REQUEST);

    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs).messages).toStrictEqual([]);
  }); 
  test('2.4. Invalid user token', () => {
    let user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user = BODY(user);

    let channel = POST(channelsCreatePATH, {
      token: user.token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    const message = POST(messageSendPATH, {
      token: 'random',
      channelId: channel.channelId,
      message: 'Test Message 2.4.1',
    });
    expect(message.statusCode).toBe(FORBIDDEN);

    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs).messages).toStrictEqual([]);
  });
  test('2.5. Invalid channelId', () => {
    let user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user = BODY(user);

    let channel = POST(channelsCreatePATH, {
      token: user.token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    const message = POST(messageSendPATH, {
      token: user.token,
      channelId: -9001,
      message: 'Test Message 2.5.1',
    });
    expect(message.statusCode).toBe(BAD_REQUEST);

    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs).messages).toStrictEqual([]);
  });
  // ! probably not the most effective test?
  test('2.6. Mixing invalid parameters', () => {
    let user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user = BODY(user);

    let channel = POST(channelsCreatePATH, {
      token: user.token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    const message = POST(messageSendPATH, {
      token: 'a string',
      channelId: -9001,
      message: -999,
    });
    expect(message.statusCode).toBe(FORBIDDEN);

    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs).messages).toStrictEqual([]);
  });
  test('2.7. User not apart of channel', () => {
    let user1 = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    user1 = BODY(user1);
    let user2 = POST(authRegisterPATH, {
      email: 'anotheremail@yahoo.com',
      password: 'letters67',
      nameFirst: 'Bill',
      nameLast: 'Harvey',
    });
    user2 = BODY(user2);

    let channel = POST(channelsCreatePATH, {
      token: user2.token,
      name: 'Test 2 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    const message1 = POST(messageSendPATH, {
      token: user1.token,
      channelId: channel.channelId,
      message: 'Test message 2.7.1',
    });
    expect(message1.statusCode).toBe(FORBIDDEN);

    const message2 = POST(messageSendPATH, {
      token: user2.token,
      channelId: channel.channelId,
      message: 'Test message 2.7.2',
    });
    expect(message2.statusCode).toBe(OK);

    const channelMsgs = GET(channelMessagesPATH, {
      token: user2.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs).messages).toStrictEqual(
      [
        {
          messageId: BODY(message2).messageId,
          message: 'Test message 2.7.2',
          uId: user2.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        }
      ]
    );
  });
});

// ! tests that dont contribute to coverage that sadly we have to remvove
/*test('1.1. One user, one channel', () => {
  let user = POST(authRegisterPATH, {
    email: 'example@gmail.com',
    password: 'pass123',
    nameFirst: 'Hayden',
    nameLast: 'Smith',
  });
  user = BODY(user);

  let channel = POST(channelsCreatePATH, {
    token: user.token,
    name: 'Test 1 Channel',
    isPublic: true,
  });
  channel = BODY(channel);

  const message = POST(messageSendPATH, {
    token: user.token,
    channelId: channel.channelId,
    message: 'Test message 1.1.1',
  });
  const channelMsgs = GET(channelMessagesPATH, {
    token: user.token,
    channelId: channel.channelId,
    start: 0,
  });
  expect(BODY(channelMsgs).messages).toStrictEqual([{
    messageId: BODY(message).messageId,
    message: 'Test message 1.1.1',
    uId: user.authUserId, // make sure this is valid
    timeSent: expect.any(Number), // any number here since its time
    isPinned: false,
    reacts: [],
  }]);
});

test('1.2. Two users, one channel', () => {
  let user1 = POST(authRegisterPATH, {
    email: 'example@gmail.com',
    password: 'pass123',
    nameFirst: 'Hayden',
    nameLast: 'Smith',
  });
  user1 = BODY(user1);
  let user2 = POST(authRegisterPATH, {
    email: 'anotheremail@yahoo.com',
    password: 'letters67',
    nameFirst: 'Bill',
    nameLast: 'Harvey',
  });
  user2 = BODY(user2);

  let channel = POST(channelsCreatePATH, {
    token: user1.token,
    name: 'Test 2 Channel',
    isPublic: true,
  });
  channel = BODY(channel);

  POST(channelJoinPATH, { token: user2.token, channelId: channel.channelId });

  const message1 = POST(messageSendPATH, {
    token: user2.token,
    channelId: channel.channelId,
    message: 'Test message 1.2.1',
  });
  const message2 = POST(messageSendPATH, {
    token: user1.token,
    channelId: channel.channelId,
    message: 'Test message 1.2.2',
  });
  const channelMsgs = GET(channelMessagesPATH, {
    token: user1.token,
    channelId: channel.channelId,
    start: 0,
  });
  expect(BODY(channelMsgs).messages).toStrictEqual(
    [
      {
        messageId: BODY(message2).messageId,
        message: 'Test message 1.2.2',
        uId: user1.authUserId,
        timeSent: expect.any(Number), // any number, but greater than previous message
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message1).messageId,
        message: 'Test message 1.2.1',
        uId: user2.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      }
    ]
  );
});

test('1.3. Two channels, one user', () => {
  let user = POST(authRegisterPATH, {
    email: 'example@gmail.com',
    password: 'pass123',
    nameFirst: 'Hayden',
    nameLast: 'Smith',
  });
  user = BODY(user);

  let channel1 = POST(channelsCreatePATH, {
    token: user.token,
    name: 'Test 1 Channel',
    isPublic: true,
  });
  channel1 = BODY(channel1);
  let channel2 = POST(channelsCreatePATH, {
    token: user.token,
    name: 'Test 2 Channel',
    isPublic: true,
  });
  channel2 = BODY(channel2);

  const message1 = POST(messageSendPATH, {
    token: user.token,
    channelId: channel1.channelId,
    message: 'Test message 1.3.1',
  });
  const message2 = POST(messageSendPATH, {
    token: user.token,
    channelId: channel2.channelId,
    message: 'Test message 1.3.2',
  });
  const channelMsgs1 = GET(channelMessagesPATH, {
    token: user.token,
    channelId: channel1.channelId,
    start: 0,
  });
  const channelMsgs2 = GET(channelMessagesPATH, {
    token: user.token,
    channelId: channel2.channelId,
    start: 0,
  });
  expect(BODY(channelMsgs1).messages).toStrictEqual([{
    messageId: BODY(message1).messageId,
    message: 'Test message 1.3.1',
    uId: user.authUserId, // make sure this is valid
    timeSent: expect.any(Number), // any number here since its time
    isPinned: false,
    reacts: [],
  }]);
  expect(BODY(channelMsgs2).messages).toStrictEqual([{
    messageId: BODY(message2).messageId,
    message: 'Test message 1.3.2',
    uId: user.authUserId, // make sure this is valid
    timeSent: expect.any(Number), // any number here since its time
    isPinned: false,
    reacts: [],
  }]);
});

test('1.4. Four users, one channel', () => {
  let user1 = POST(authRegisterPATH, {
    email: 'example@gmail.com',
    password: 'pass123',
    nameFirst: 'Hayden',
    nameLast: 'Smith',
  });
  user1 = BODY(user1);
  let user2 = POST(authRegisterPATH, {
    email: 'anotheremail@yahoo.com',
    password: 'letters67',
    nameFirst: 'Bill',
    nameLast: 'Harvey',
  });
  user2 = BODY(user2);
  let user3 = POST(authRegisterPATH, {
    email: 'aperson@outlook.com',
    password: 'qwerty',
    nameFirst: 'Bob',
    nameLast: 'Marley',
  });
  user3 = BODY(user3);
  let user4 = POST(authRegisterPATH, {
    email: 'student@unsw.com',
    password: 'zxcvbb',
    nameFirst: 'Sam',
    nameLast: 'Foo',
  });
  user4 = BODY(user4);

  let channel = POST(channelsCreatePATH, {
    token: user1.token,
    name: 'Test 1 Channel',
    isPublic: true,
  });
  channel = BODY(channel);

  POST(channelJoinPATH, { token: user2.token, channelId: channel.channelId });
  POST(channelJoinPATH, { token: user3.token, channelId: channel.channelId });
  POST(channelJoinPATH, { token: user4.token, channelId: channel.channelId });

  const message1 = POST(messageSendPATH, {
    token: user2.token,
    channelId: channel.channelId,
    message: 'Test message 1.4.1',
  });
  const message2 = POST(messageSendPATH, {
    token: user1.token,
    channelId: channel.channelId,
    message: 'Test message 1.4.2',
  });
  const message3 = POST(messageSendPATH, {
    token: user3.token,
    channelId: channel.channelId,
    message: 'Test message 1.4.3',
  });
  const message4 = POST(messageSendPATH, {
    token: user2.token,
    channelId: channel.channelId,
    message: 'Test message 1.4.4',
  });
  const message5 = POST(messageSendPATH, {
    token: user4.token,
    channelId: channel.channelId,
    message: 'Test message 1.4.5',
  });
  // have 5 messages, one from each user with one extra in the middle
  const channelMsgs = GET(channelMessagesPATH, {
    token: user1.token,
    channelId: channel.channelId,
    start: 0,
  });
  expect(BODY(channelMsgs).messages).toStrictEqual(
    [
      {
        messageId: BODY(message5).messageId,
        message: 'Test message 1.4.5',
        uId: user4.authUserId,
        timeSent: expect.any(Number), // any number, but greater than previous message
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message4).messageId,
        message: 'Test message 1.4.4',
        uId: user2.authUserId,
        timeSent: expect.any(Number), // any number, but greater than previous message
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message3).messageId,
        message: 'Test message 1.4.3',
        uId: user3.authUserId,
        timeSent: expect.any(Number), // any number, but greater than previous message
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message2).messageId,
        message: 'Test message 1.4.2',
        uId: user1.authUserId,
        timeSent: expect.any(Number), // any number, but greater than previous message
        isPinned: false,
        reacts: [],
      },
      {
        messageId: BODY(message1).messageId,
        message: 'Test message 1.4.1',
        uId: user2.authUserId, // make sure this is valid
        timeSent: expect.any(Number), // any number here since its time
        isPinned: false,
        reacts: [],
      },
    ]
  );
});*/

