import {
  POST, DELETE, BODY,
  clearPATH, notificationsGetPATH, GET
} from './httpRequestsV1';

// ===== STANDARD OPERATIONS ====== //
import {
  registerUser, createChannel, createDm, sendDmMessage, sendMessage, getDmMessage, getMessage, joinChannel, channelInvite, messageEdit, reactMessage, messageShare
} from './standardOperations';

// ===== STANDARD OUTPUT ===== //
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;
// ===== STANDARD INPUTS ===== //
const TAG_VALID = 'hey@haydensmith0';
const TAG_VALID3 = 'hey@haydensmith0 and @haydensmith1 and greetings @haydensmith2 ';
const MESSAGE_VALID = 'howdy, hows everyone going';
const TAG_VALID2 = 'yooo you will not beleive this @haydensmith0';
const TAG_INVALID = 'hey I think this is your username right@goblin';
const MULTAG_VALID = 'I got a whole squad of you @haydensmith0@haydensmith0@haydensmith0';
// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('testing correct functionality', () => {
  test('Testing if tagging works for channel messages', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    const join = joinChannel(user1.token, channel1);
    const message1 = sendMessage(user1.token, channel1, TAG_VALID);

    // user reacts to message
    const notif = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([{ dmId: -1, channelId: channel1, notificationMessage: 'haydensmith tagged you in Imagine Dragons: hey@haydensmith0' }]);
  });
  test('Testing if channel invite works', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    const invite = channelInvite(user2.token, channel1, user1.authUserId);
    // user reacts to message
    const notif = GET(notificationsGetPATH, {
      token: user1.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toMatchObject([{ dmId: -1, channelId: channel1, notificationMessage: 'haydensmith0 added you to Imagine Dragons' }]);
  });
  test('Testing if dm creation and tagging in dm messages work', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const dm1 = createDm(user1.token, [user2.authUserId]);
    const message1 = sendDmMessage(user1.token, dm1, TAG_VALID);

    // user reacts to message
    const notif = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([{ dmId: 1, channelId: -1, notificationMessage: 'haydensmith tagged you in haydensmith, haydensmith0: hey@haydensmith0' }, { dmId: 1, channelId: -1, notificationMessage: 'haydensmith added you to haydensmith, haydensmith0' }]);
  });

  test('Testing if editing a channel message works for tags', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user2.token);
    const join = joinChannel(user1.token, channel1);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);
    const notif = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([]);

    const message2 = messageEdit(user1.token, message1, TAG_VALID);
    const notif2 = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(BODY(notif2).notifications).toStrictEqual([{ dmId: -1, channelId: expect.any(Number), notificationMessage: 'haydensmith tagged you in Imagine Dragons: hey@haydensmith0' }]);
    expect(notif2.statusCode).toBe(OK);
  });
  test('Testing if editing a dm message works for tags', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const dm1 = createDm(user2.token, [user1.authUserId]);
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);
    const notif = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([]);

    const message2 = messageEdit(user1.token, message1, TAG_VALID);
    const notif2 = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(BODY(notif2).notifications).toStrictEqual([{ dmId: 1, channelId: expect.any(Number), notificationMessage: 'haydensmith tagged you in haydensmith, haydensmith0: hey@haydensmith0' }]);
    expect(notif2.statusCode).toBe(OK);
  });
  test('still contains same tag', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const dm1 = createDm(user2.token, [user1.authUserId]);
    const message1 = sendDmMessage(user1.token, dm1, TAG_VALID + MESSAGE_VALID);
    const notif = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([]);

    const message2 = messageEdit(user1.token, message1, TAG_VALID);
    const notif2 = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(BODY(notif2).notifications).toStrictEqual([{ dmId: 1, channelId: expect.any(Number), notificationMessage: 'haydensmith tagged you in haydensmith, haydensmith0: hey@haydensmith0' }]);
    expect(notif2.statusCode).toBe(OK);
  });

  test('Testing if reactions work', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const dm1 = createDm(user1.token, [user2.authUserId]);
    const message1 = sendDmMessage(user1.token, dm1, TAG_VALID);
    const react = reactMessage(user2.token, message1, 1);
    // user reacts to message
    const notif = GET(notificationsGetPATH, {
      token: user1.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([{ dmId: 1, channelId: -1, notificationMessage: 'haydensmith0 reacted to your message in haydensmith, haydensmith0' }]);
  });

  test('Testing if dm message share works', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const dm1 = createDm(user1.token, [user2.authUserId]);
    const message1 = sendDmMessage(user1.token, dm1, MESSAGE_VALID);
    const share = messageShare(user1.token, message1, -1, dm1, TAG_VALID);
    // user reacts to message
    const notif = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([{ dmId: 1, channelId: -1, notificationMessage: 'haydensmith tagged you in haydensmith, haydensmith0: shared: howdy, hows ' }, { dmId: 1, channelId: -1, notificationMessage: 'haydensmith added you to haydensmith, haydensmith0' }]);
  });

  test('Testing if channel message share works', () => {
    // register a user
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    // user1 creates a channel + sends message
    const channel1 = createChannel(user1.token);
    const channel2 = createChannel(user2.token);
    const join = joinChannel(user2.token, channel1);
    const join2 = joinChannel(user1.token, channel2);
    const message1 = sendMessage(user1.token, channel1, MESSAGE_VALID);
    const share = messageShare(user1.token, message1, channel2, -1, TAG_VALID);
    // user reacts to message
    const notif = GET(notificationsGetPATH, {
      token: user2.token,
    });
    expect(notif.statusCode).toBe(OK);
    expect(BODY(notif).notifications).toStrictEqual([{ dmId: -1, channelId: 2, notificationMessage: 'haydensmith tagged you in Imagine Dragons: shared: howdy, hows ' }]);
  });
});

test('More than 20 notifications in total', () => {
  // register a user
  const user1 = registerUser(1);
  const user2 = registerUser(2);
  // user1 creates a channel + sends message
  const channel1 = createChannel(user2.token);
  const join = joinChannel(user1.token, channel1);
  let message1;
  for (let i = 0; i < 22; i++) {
    message1 = sendMessage(user1.token, channel1, TAG_VALID);
  }
  const message2 = messageEdit(user1.token, message1, TAG_VALID2);
  const dm1 = createDm(user1.token, [user2.authUserId]);
  const message3 = sendDmMessage(user1.token, dm1, TAG_VALID);
  const notif2 = GET(notificationsGetPATH, {
    token: user2.token,
  });

  const notif = GET(notificationsGetPATH, {
    token: user2.token,
  });
  expect(notif.statusCode).toBe(OK);
  expect(BODY(notif).notifications.length).toStrictEqual(20);
  expect(BODY(notif).notifications[0]).toStrictEqual({ dmId: 1, channelId: -1, notificationMessage: 'haydensmith tagged you in haydensmith, haydensmith0: hey@haydensmith0' });
  expect(BODY(notif).notifications[1]).toStrictEqual({ dmId: 1, channelId: -1, notificationMessage: 'haydensmith added you to haydensmith, haydensmith0' });
  // expect(BODY(notif)[2]).toStrictEqual({dmId: -1, channelId: 1, notificationMessage: "haydensmith tagged you in Imagine Dragons: yooo you will not be"});
  for (let i = 2; i < 20; i++) {
    expect(BODY(notif).notifications[i]).toStrictEqual({ dmId: -1, channelId: 1, notificationMessage: 'haydensmith tagged you in Imagine Dragons: hey@haydensmith0' });
  }
});

test('Testing invalid handleStr', () => {
  // register a user
  const user1 = registerUser(1);
  const user2 = registerUser(2);
  // user1 creates a channel + sends message
  const channel1 = createChannel(user2.token);
  const join = joinChannel(user1.token, channel1);
  const message1 = sendMessage(user1.token, channel1, TAG_INVALID);

  // user reacts to message
  const notif = GET(notificationsGetPATH, {
    token: user2.token,
  });
  expect(notif.statusCode).toBe(OK);
  expect(BODY(notif).notifications).toStrictEqual([]);
});

test('Testing multiple of the same tags', () => {
  // register a user
  const user1 = registerUser(1);
  const user2 = registerUser(2);
  // user1 creates a channel + sends message
  const channel1 = createChannel(user1.token);
  const join = joinChannel(user2.token, channel1);
  const message1 = sendMessage(user1.token, channel1, MULTAG_VALID);
  // user reacts to message
  const notif = GET(notificationsGetPATH, {
    token: user2.token,
  });
  expect(notif.statusCode).toBe(OK);
  expect(BODY(notif).notifications).toStrictEqual([{ dmId: -1, channelId: 1, notificationMessage: 'haydensmith tagged you in Imagine Dragons: I got a whole squad ' }]);
});

test('Testing edit to contain multiple new tags with some same as ogmessage', () => {
  // register a user
  const user1 = registerUser(1);
  const user2 = registerUser(2);
  const user3 = registerUser(3);
  const user4 = registerUser(4);
  // user1 creates a channel + sends message
  const channel1 = createChannel(user1.token);
  const join = joinChannel(user2.token, channel1);
  const join2 = joinChannel(user3.token, channel1);
  const join3 = joinChannel(user4.token, channel1);
  const message1 = sendMessage(user1.token, channel1, TAG_VALID);
  const message2 = messageEdit(user1.token, message1, TAG_VALID3);
  // user reacts to message
  const notif = GET(notificationsGetPATH, {
    token: user3.token,
  });
  const notif2 = GET(notificationsGetPATH, {
    token: user2.token,
  });
  const notif3 = GET(notificationsGetPATH, {
    token: user4.token,
  });
  expect(notif.statusCode).toBe(OK);
  expect(BODY(notif).notifications).toStrictEqual([{ dmId: -1, channelId: 1, notificationMessage: 'haydensmith tagged you in Imagine Dragons: hey@haydensmith0 and' }]);
  expect(BODY(notif2).notifications).toStrictEqual([{ dmId: -1, channelId: 1, notificationMessage: 'haydensmith tagged you in Imagine Dragons: hey@haydensmith0' }]);
  expect(BODY(notif3).notifications).toStrictEqual([{ dmId: -1, channelId: 1, notificationMessage: 'haydensmith tagged you in Imagine Dragons: hey@haydensmith0 and' }]);
});
