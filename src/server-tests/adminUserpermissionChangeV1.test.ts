import { GET, POST, DELETE, BODY, adminUserRemovePATH, channelsCreatePATH } from './httpRequestsV1';
import { expect } from '@jest/globals';
import {
  clearPATH,
  authRegisterPATH,
  adminUserpermissionChangePATH
} from './httpRequestsV1';

// standard operations
import {
  registerUser, createChannel, sendMessage, messageEdit, joinChannel
} from './standardOperations';

// standard outputs
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// standard inputs
const GLOBAL_OWNER = 1;
const GLOBAL_MEMBER = 2;
const INVALID_PERMISSION_ID = 3;

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('adminUserpermissionChangeV1 returns 400', () => {
  test('uId does not refer to a valid user', () => {
    const user1 = registerUser(1);

    const invalidId = user1.authUserId + 1;
    const result = POST(adminUserpermissionChangePATH, {
      token: user1.token,
      uId: invalidId,
      permissionId: GLOBAL_OWNER
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('uId refers to a user who is the only global owner and they are being demoted to a user', () => {
    const user1 = registerUser(1);

    const result = POST(adminUserpermissionChangePATH, {
      token: user1.token,
      uId: user1.authUserId,
      permissionId: GLOBAL_MEMBER
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('permissionId is invalid', () => {
    const user1 = registerUser(1);

    const user2 = registerUser(2);

    const result = POST(adminUserpermissionChangePATH, {
      token: user1.token,
      uId: user2.authUserId,
      permissionId: INVALID_PERMISSION_ID
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });

  test('the user already has the permissions level of permissionId', () => {
    const user1 = registerUser(1);

    const user2 = registerUser(2);

    const result = POST(adminUserpermissionChangePATH, {
      token: user1.token,
      uId: user2.authUserId,
      permissionId: GLOBAL_MEMBER
    });

    expect(result.statusCode).toBe(BAD_REQUEST);
  });
});

describe('adminUserpermissionChangeV1 returns 403', () => {
  test('the authorised user is not a global owner', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    const user3 = registerUser(3);

    const result = POST(adminUserpermissionChangePATH, {
      token: user2.token,
      uId: user3.authUserId,
      permissionId: GLOBAL_OWNER
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });
});

describe('adminUserpermissionChangeV1 correct return type', () => {
  test('general return', () => {
    const user1 = registerUser(1);

    const user2 = registerUser(2);

    const result = POST(adminUserpermissionChangePATH, {
      token: user1.token,
      uId: user2.authUserId,
      permissionId: GLOBAL_OWNER
    });

    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});
  });

  test('promoted user can demote others and remove users', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);
    const user3 = registerUser(3);

    const result1 = POST(adminUserpermissionChangePATH, {
      token: user1.token,
      uId: user2.authUserId,
      permissionId: GLOBAL_OWNER
    });

    expect(result1.statusCode).toBe(OK);
    expect(BODY(result1)).toStrictEqual({});

    const result2 = POST(adminUserpermissionChangePATH, {
      token: user2.token,
      uId: user1.authUserId,
      permissionId: GLOBAL_MEMBER
    });
    expect(result2.statusCode).toBe(OK);
    expect(BODY(result2)).toStrictEqual({});

    const result3 = DELETE(adminUserRemovePATH, {
      token: user2.token,
      uId: user3.authUserId
    });
    expect(result3.statusCode).toBe(OK);
  });

  test('promoted user has owner permissions in channels', () => {
    const user1 = registerUser(1);
    const user2 = registerUser(2);

    // user 1 creates public channel
    const channel1 = createChannel(user1.token);
    joinChannel(user2.token, channel1);

    // user1 promotes user2
    const result = POST(adminUserpermissionChangePATH, {
      token: user1.token,
      uId: user2.authUserId,
      permissionId: GLOBAL_OWNER
    });
    expect(result.statusCode).toBe(OK);
    expect(BODY(result)).toStrictEqual({});

    // user1 sends a message
    const message1 = sendMessage(user1.token, channel1, 'howdy whats up');

    // user2 can edit message via global permissions
    messageEdit(user2.token, message1, 'howdy whats up!!!');

    // user 1 creates private channel
    const channel2 = BODY(POST(channelsCreatePATH, {
      token: user1.token,
      name: 'private channel',
      isPublic: false,
    })).channelId;

    // user2 has permissions to join due to being an global owner
    joinChannel(user2.token, channel2);
  });
});
