// @ts-nocheck
import { expect } from '@jest/globals';
import {
  DELETE, BODY, POST, PUT,
  clearPATH, adminUserRemovePATH, authRegisterPATH, userProfileSethandlePATH, userProfileSetemailPATH
} from './httpRequestsV1';
import { getData } from '../dataStore';

// standard outputs
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

//standard operations
import { 
  registerUser, createChannel, createDm, joinChannel, sendDmMessage, sendMessage, getDmMessage, getMessage, getProfile
} from './standardOperations';

// valid inputs functions to setup tests
const MESSAGE_VALID = 'howdy whats up';
const PASSWORD_VALID = 'password';

// ! these inputs must be different from those in standardOperations
const EMAIL_VALID = 'funkymonkeys@gmail.com';
const FIRSTNAME_VALID = 'Josh';
const LASTNAME_VALID = 'Lim';
const HANDLE_VALID = 'joshlim';

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('adminUserRemoveV1 returns 400', () => {
  test('uId does not refer to a valid user', () => {
    const user1 = registerUser(1);

    const invalidUID = user1.authUserId + 1;
    const result = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: invalidUID,
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('uId refers to a user who is the only global owner', () => {
    const user1 = registerUser(1);

    const result = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: user1.authUserId,
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });
});

describe('adminUserRemoveV1 returns 403', () => {
  test('the authorised user is not a global owner', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    const result = DELETE(adminUserRemovePATH, {
      token: user2.token,
      uId: user3.authUserId,
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });
});

describe('adminUserRemoveV1 correct return type', () => {
  test('correct return type', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    const result = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: user2.authUserId,
    });
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});
  });

  test('user profile gets updated', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    const result = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: user2.authUserId,
    });
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});

    const profile = getProfile(user1.token, user2.authUserId);
    expect(profile.uId).toBe(user2.authUserId);
    expect(profile.nameFirst).toBe('Removed');
    expect(profile.nameLast).toBe('user');
  });

  test('remove user from dm and channel as well', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    const dm1 = createDm(user1.token, [user2.authUserId]);

    const channel1 = createChannel(user2.token);

    const channel2 = createChannel(user3.token);

    joinChannel(user2.token, channel2);

    const result = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: user2.authUserId,
    });

    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});
  });

  test('user channel and dm messages get modified', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    
    const channel1 = createChannel(user1.token);
    joinChannel(user2.token, channel1);

    const dm1 = createDm(user2.token, [user1.authUserId]);

    const message1 = sendMessage(user2.token, channel1, MESSAGE_VALID);
    const message2 = sendDmMessage(user2.token, dm1, MESSAGE_VALID);

    const channelMessage1 = getMessage(user1.token, channel1)[0].message;
    expect(channelMessage1).toBe(MESSAGE_VALID);
    const dmMessage1 = getDmMessage(user1.token, dm1)[0].message;
    expect(dmMessage1).toBe(MESSAGE_VALID);

    const result = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: user2.authUserId
    });
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});

    const channelMessage2 = getMessage(user1.token, channel1)[0].message;
    expect(channelMessage2).toBe('Removed user');
    const dmMessage2 = getDmMessage(user1.token, dm1)[0].message;
    expect(dmMessage2).toBe('Removed user');
  });

  test('user email and handle are reusable after the user is removed', () => {    
    // register a global owners
    const user1 = registerUser(1);

    // register a user2
    const user2 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(user2.statusCode).toBe(OK);

    // remove user2
    const result1 = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: BODY(user2).authUserId
    });
    expect(result1.statusCode).toBe(OK);
    expect(BODY(result1)).toStrictEqual({});

    // try to register a user with the same email (should be OK)
    const user3 = POST(authRegisterPATH, {
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
      nameFirst: FIRSTNAME_VALID,
      nameLast: LASTNAME_VALID
    });
    expect(user3.statusCode).toBe(OK);

    // remove user3
    const result2 = DELETE(adminUserRemovePATH, {
      token: user1.token,
      uId: BODY(user3).authUserId
    });
    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    // register user4 
    const user4 = registerUser(4);
    
    // user4 tries to set their handleStr to user3's
    const setHandle = PUT(userProfileSethandlePATH, {
      token: user4.token,
      handleStr: HANDLE_VALID
    });
    expect(setHandle.statusCode).toBe(OK);

    // user4 tries to set their email to user3's
    const setEmail = PUT(userProfileSetemailPATH, {
      token: user4.token,
      email: EMAIL_VALID
    });
    expect(setEmail.statusCode).toBe(OK);

    // check that profiles for user2 and 3 can still be accessed
    const profile1 = getProfile(user1.token, BODY(user2).authUserId);
    expect(profile1.uId).toBe(BODY(user2).authUserId);
    expect(profile1.nameFirst).toBe('Removed');
    expect(profile1.nameLast).toBe('user');

    const profile2 = getProfile(user1.token, BODY(user3).authUserId);
    expect(profile2.uId).toBe(BODY(user3).authUserId);
    expect(profile2.nameFirst).toBe('Removed');
    expect(profile2.nameLast).toBe('user');
  });
});
