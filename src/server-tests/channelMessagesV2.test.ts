// @ts-nocheck

import { GET, DELETE, POST, BODY } from './httpRequestsV1.ts';
import { authRegisterPATH, clearPATH, messageSendPATH, channelsCreatePATH, channelMessagesPATH, channelJoinPATH } from './httpRequestsV1.ts';

/**
 * channelMessages takes in
 * token, channelId and start
 * returns { messages[{message}], start, end }
 *
 * Tests Outline:
 * 1. General Tests for expected results
 * 2. Invalid values passed into function
 * 3. Edge case testing
 *
*/

const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const OK = 200;

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('1. General Tests', () => {
  test('1.2. One user, one channel, more messages', () => {
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

    const message1 = POST(messageSendPATH, {
      token: user.token,
      channelId: channel.channelId,
      message: 'Test message 1.1.1',
    });
    const message2 = POST(messageSendPATH, {
      token: user.token,
      channelId: channel.channelId,
      message: 'Test message 1.1.2',
    });
    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(BODY(channelMsgs)).toStrictEqual(
      {
        messages: [
          {
            messageId: BODY(message2).messageId,
            message: 'Test message 1.1.2',
            uId: user.authUserId,
            timeSent: expect.any(Number),
            isPinned: false,
            reacts: [],
          },
          {
            messageId: BODY(message1).messageId,
            message: 'Test message 1.1.1',
            uId: user.authUserId,
            timeSent: expect.any(Number),
            isPinned: false,
            reacts: [],
          }
        ],
        start: 0,
        end: -1,
      }
    );
  });
  
  test('1.5. Five users, two channels, several messages', () => {
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

    POST(channelJoinPATH, { token: user1.token, channelId: channel2.channelId });
    POST(channelJoinPATH, { token: user2.token, channelId: channel2.channelId });
    POST(channelJoinPATH, { token: user3.token, channelId: channel2.channelId });
    POST(channelJoinPATH, { token: user4.token, channelId: channel2.channelId });
    POST(channelJoinPATH, { token: user5.token, channelId: channel2.channelId });
    POST(channelJoinPATH, { token: user1.token, channelId: channel1.channelId });
    POST(channelJoinPATH, { token: user2.token, channelId: channel1.channelId });
    POST(channelJoinPATH, { token: user3.token, channelId: channel1.channelId });
    POST(channelJoinPATH, { token: user4.token, channelId: channel1.channelId });
    POST(channelJoinPATH, { token: user5.token, channelId: channel1.channelId });

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

    expect(BODY(channelMsgs1)).toStrictEqual({
      messages: [
        {
          messageId: BODY(message10).messageId,
          message: 'Test message 1.5.10',
          uId: user4.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message8).messageId,
          message: 'Test message 1.5.8',
          uId: user2.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message7).messageId,
          message: 'Test message 1.5.7',
          uId: user3.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message3).messageId,
          message: 'Test message 1.5.3',
          uId: user3.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message2).messageId,
          message: 'Test message 1.5.2',
          uId: user1.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
    expect(BODY(channelMsgs2)).toStrictEqual({
      messages: [
        {
          messageId: BODY(message9).messageId,
          message: 'Test message 1.5.9',
          uId: user4.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message6).messageId,
          message: 'Test message 1.5.6',
          uId: user5.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message5).messageId,
          message: 'Test message 1.5.5',
          uId: user4.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message4).messageId,
          message: 'Test message 1.5.4',
          uId: user2.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message1).messageId,
          message: 'Test message 1.5.1',
          uId: user2.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });
  test('1.6 one user sends 51 messages in one channel', () => {
    // register user
    let user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    // create channel
    let channel = POST(channelsCreatePATH, {
      token: BODY(user).token,
      name: 'Test 1 Channel',
      isPublic: true,
    });
    channel = BODY(channel);

    for (let messageNum= 0; messageNum < 51; messageNum++) {
      POST(messageSendPATH, {
        token: BODY(user).token,
        channelId: channel.channelId,
        message: messageNum.toString(),
      });
    }

      let channelMsgs = GET(channelMessagesPATH, {
        token: BODY(user).token,
        channelId: channel.channelId,
        start: 0,
      });

      expect(channelMsgs.statusCode).toBe(OK);
      expect(BODY(channelMsgs).start).toStrictEqual(0);
      expect(BODY(channelMsgs).end).toStrictEqual (50);

      channelMsgs = GET(channelMessagesPATH, {
        token: BODY(user).token,
        channelId: channel.channelId,
        start: BODY(channelMsgs).end,
      });

      expect(channelMsgs.statusCode).toBe(OK);
      expect(BODY(channelMsgs).start).toStrictEqual(50);
      expect(BODY(channelMsgs).end).toStrictEqual(-1);
    
  });
});

describe('2. Error testing', () => {
  test('2.1. Invalid channelId', () => {
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
      message: 'Test message 2.1.1',
    });
    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: -999,
      start: 0,
    });
    expect(channelMsgs.statusCode).toBe(BAD_REQUEST)
  });
  test('2.2. Start greater than num of messages', () => {
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
      message: 'Test message 2.2.1',
    });
    const channelMsgs = GET(channelMessagesPATH, {
      token: user.token,
      channelId: channel.channelId,
      start: 2,
    });
    expect(channelMsgs.statusCode).toBe(BAD_REQUEST);
  });
  test('2.3. Valid channelId, user not apart of channel', () => {
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

    const message = POST(messageSendPATH, {
      token: user1.token,
      channelId: channel.channelId,
      message: 'Test message 2.3.1',
    });

    const channelMsgs = GET(channelMessagesPATH, {
      token: user2.token,
      channelId: channel.channelId,
      start: 0,
    });
    expect(channelMsgs.statusCode).toBe(FORBIDDEN);
  });
});

// ! tests removed because we need to be < 2mins

/*test('1.1. One user, one channel, one message', () => {
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
  expect(BODY(channelMsgs)).toStrictEqual(
    {
      messages: [{
        messageId: 1,
        message: 'Test message 1.1.1',
        uId: user.authUserId,
        timeSent: expect.any(Number),
        isPinned: false,
        reacts: [],
      }],
      start: 0,
      end: -1,
    }
  );
});*/
/*test('1.4. Two users, two channels, few messages', () => {
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
  POST(channelJoinPATH, { token: user1.token, channelId: channel2.channelId });
  POST(channelJoinPATH, { token: user2.token, channelId: channel1.channelId });

  const message1 = POST(messageSendPATH, {
    token: user2.token,
    channelId: channel1.channelId,
    message: 'Test message 1.4.1',
  });
  const message2 = POST(messageSendPATH, {
    token: user1.token,
    channelId: channel2.channelId,
    message: 'Test message 1.4.2',
  });
  const message3 = POST(messageSendPATH, {
    token: user2.token,
    channelId: channel2.channelId,
    message: 'Test message 1.4.3',
  });
  const message4 = POST(messageSendPATH, {
    token: user1.token,
    channelId: channel1.channelId,
    message: 'Test message 1.4.4',
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
  expect(BODY(channelMsgs1)).toStrictEqual(
    {
      messages: [
        {
          messageId: BODY(message4).messageId,
          message: 'Test message 1.4.4',
          uId: user1.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message1).messageId,
          message: 'Test message 1.4.1',
          uId: user2.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],          
        },
      ],
      start: 0,
      end: -1,
    }
  );
  expect(BODY(channelMsgs2)).toStrictEqual(
    {
      messages: [
        {
          messageId: BODY(message3).messageId,
          message: 'Test message 1.4.3',
          uId: user2.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message2).messageId,
          message: 'Test message 1.4.2',
          uId: user1.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    }
  );
});*/

/*test('1.3. Two users, one channel, few messages', () => {
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
    name: 'Test 1 Channel',
    isPublic: true,
  });
  channel = BODY(channel);

  POST(channelJoinPATH, { token: user2.token, channelId: channel.channelId });

  const message1 = POST(messageSendPATH, {
    token: user2.token,
    channelId: channel.channelId,
    message: 'Test message 1.3.1',
  });
  const message2 = POST(messageSendPATH, {
    token: user1.token,
    channelId: channel.channelId,
    message: 'Test message 1.3.2',
  });
  const channelMsgs = GET(channelMessagesPATH, {
    token: user1.token,
    channelId: channel.channelId,
    start: 0,
  });
  expect(BODY(channelMsgs)).toStrictEqual(
    {
      messages: [
        {
          messageId: BODY(message2).messageId,
          message: 'Test message 1.3.2',
          uId: user1.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
        {
          messageId: BODY(message1).messageId,
          message: 'Test message 1.3.1',
          uId: user2.authUserId,
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    }
  );
});*/
