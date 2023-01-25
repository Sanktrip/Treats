import {
  POST, DELETE, BODY, GET,
  clearPATH, standupStartPATH,
  standupActivePATH,
  standupSendPATH
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import {
  registerUser, createChannel, getMessage, joinChannel,
} from './standardOperations';

// ===== STANDARD INPUT ===== //
const VALID_LENGTH = 0.8;
const VALID_MESSAGE = 'Yoo is this a standup?';
const INVALID_LENGTH = -1;
const VALID_USERHANDLE = 'haydensmith0:';
const VALID_USERHANDLE2 = 'haydensmith:';
const INVALID_MESSAGE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam condimentum nibh in porta dignissim. Sed elit lectus, vestibulum eget porttitor luctus, ullamcorper ac dolor. Suspendisse potenti. In hac habitasse platea dictumst. Aenean nulla tortor, maximus ac dui a, rutrum congue ex. Aliquam et consectetur nunc. Aenean a est leo. Donec ex justo, laoreet ut libero at, rhoncus mattis neque. Donec tellus tellus, convallis in rhoncus ut, ullamcorper id arcu. Cras eget lectus non sem congue pulvinar vel quis nulla. Pellentesque et pulvinar odio. Donec fringilla massa ac turpis porta, et viverra purus rhoncus. Nam ornare magna sit amet arcu convallis, at varius lorem dignissim. Curabitur maximus in tellus in pharetra. Phasellus interdum condimentum tellus, vitae suscipit massa. Proin eu tortor tincidunt, maximus augue sit amet, laoreet ipsum. Suspendisse potenti. Donec imperdiet eros ac lorem vestibulum scelerisque ut vehicula felis. Praesent quis lorem odio. Cras consectetur nunc in urna venenatis laoreet. Fusce non consectetur dolor, efficitur bibendum lorem.';

// ===== STANDARD OUTPUT ===== //
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const OUT_MESSAGE = VALID_USERHANDLE + ' ' + VALID_MESSAGE + '\n' + VALID_USERHANDLE2 + ' ' + VALID_MESSAGE;

// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing correct functionality', () => {
  test('Testing if standupstart works correctly', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    joinChannel(user1.token, channel1);

    // user 1 starts standup
    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    // both users send messages during standup
    const message = POST(standupSendPATH, {
      token: user2.token,
      channelId: channel1,
      message: VALID_MESSAGE,
    });
    const message2 = POST(standupSendPATH, {
      token: user1.token,
      channelId: channel1,
      message: VALID_MESSAGE,
    });
    expect(message.statusCode).toBe(OK);
    expect(message2.statusCode).toBe(OK);
    
    // expect that standup is active
    const active = GET(standupActivePATH, {
      token: user2.token,
      channelId: channel1
    });
    expect(BODY(active)).toStrictEqual({ isActive: true, timeFinish: expect.any(Number) });

    sleepFor(VALID_LENGTH * 1000);

    const messageReceived = getMessage(user2.token, channel1)[0];
    expect(messageReceived).toBeDefined();
    expect(messageReceived).toStrictEqual({
      isPinned: false,
      message: OUT_MESSAGE,
      messageId: expect.any(Number),
      reacts: [],
      timeSent: expect.any(Number),
      uId: user1.authUserId
    });
    expect(message.statusCode).toBe(OK);
    const active2 = GET(standupActivePATH, {
      token: user2.token,
      channelId: channel1
    });
    expect(BODY(active2)).toStrictEqual({ isActive: false, timeFinish: expect.any(Number) });
  });
});

describe('Errors for standupStart', () => {
  test('Invalid ChannelId', () => {
  // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    joinChannel(user1.token, channel1);

    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1 * 1000,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(BAD_REQUEST);
    const message = POST(standupSendPATH, {
      token: user2.token,
      channelId: channel1,
      message: VALID_MESSAGE,
    });

    const active = GET(standupActivePATH, {
      token: user2.token,
      channelId: channel1
    });
    expect(BODY(active)).toStrictEqual({ isActive: false, timeFinish: null });
    expect(message.statusCode).toBe(BAD_REQUEST);
  });

  test('Negative length', () => {
  // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    const join = joinChannel(user1.token, channel1);

    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1,
      length: INVALID_LENGTH
    });
    expect(start.statusCode).toBe(BAD_REQUEST);
    const message = POST(standupSendPATH, {
      token: user2.token,
      channelId: channel1,
      message: VALID_MESSAGE,
    });

    const active = GET(standupActivePATH, {
      token: user2.token,
      channelId: channel1
    });
    expect(BODY(active)).toStrictEqual({ isActive: false, timeFinish: null });
    expect(message.statusCode).toBe(BAD_REQUEST);
  });

  test('standUp is already running', () => {
  // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    joinChannel(user1.token, channel1);

    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    const start2 = POST(standupStartPATH, {
      token: user2.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start2.statusCode).toBe(BAD_REQUEST);
  });

  test('AuthUserId is not valid', () => {
  // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);

    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(FORBIDDEN);

    const message = POST(standupSendPATH, {
      token: user2.token,
      channelId: channel1,
      message: VALID_MESSAGE,
    });

    const active = GET(standupActivePATH, {
      token: user2.token,
      channelId: channel1
    });
    expect(BODY(active)).toStrictEqual({ isActive: false, timeFinish: null });
    expect(message.statusCode).toBe(BAD_REQUEST);
  });
});

describe('Error checking for standupActive', () => {
  test('channelId is invalid', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    joinChannel(user1.token, channel1);

    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    const active = GET(standupActivePATH, {
      token: user2.token,
      channelId: channel1 * 1000
    });
    expect(active.statusCode).toBe(BAD_REQUEST);
  });

  test('authUserId is not in channel', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);

    const start = POST(standupStartPATH, {
      token: user2.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    const active = GET(standupActivePATH, {
      token: user1.token,
      channelId: channel1
    });
    expect(active.statusCode).toBe(FORBIDDEN);
  });
});

describe('Error checking for standupSend', () => {
  test('channelId is invalid', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    joinChannel(user1.token, channel1);

    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    const message = POST(standupSendPATH, {
      token: user2.token,
      channelId: channel1 + 1,
      message: VALID_MESSAGE,
    });

    expect(message.statusCode).toBe(BAD_REQUEST);
  });

  test('Length of message over 1000 characters', () => {
    const user1 = registerUser(1);
    // user2 creates a channel
    const channel1 = createChannel(user1.token);

    const start = POST(standupStartPATH, {
      token: user1.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    const message = POST(standupSendPATH, {
      token: user1.token,
      channelId: channel1,
      message: INVALID_MESSAGE,
    });
    expect(message.statusCode).toBe(BAD_REQUEST);
  });

  test('Standup is not active', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    joinChannel(user1.token, channel1);
    const channel2 = createChannel(user2.token);

    const start = POST(standupStartPATH, {
      token: user2.token,
      channelId: channel2,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    const message = POST(standupSendPATH, {
      token: user2.token,
      channelId: channel1,
      message: VALID_MESSAGE,
    });
    expect(message.statusCode).toBe(BAD_REQUEST);
  });
  
  test('user is not part of the channel', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);

    const start = POST(standupStartPATH, {
      token: user2.token,
      channelId: channel1,
      length: VALID_LENGTH
    });
    expect(start.statusCode).toBe(OK);

    const message = POST(standupSendPATH, {
      token: user1.token,
      channelId: channel1,
      message: VALID_MESSAGE,
    });
    expect(message.statusCode).toBe(FORBIDDEN);
  });
});

/**
 * puts program to sleep for some time
 * 
 * @param {number} sleepDuration length of sleep in miliseconds
 */
function sleepFor(sleepDuration: number) {
  const now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration) {
    jest.setTimeout(1);
  }
}
