import { GET, DELETE, POST, BODY } from './httpRequestsV1';
import { authRegisterPATH, clearPATH, userProfilePATH } from './httpRequestsV1';

/**
 * Types of tests:
 *
 * 1. General Tests for expected usage
 * 2. Invald parameters i.e. incorrect token, userID
 *
 */

// result constants
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('1. General Usage Tests', () => {
  test('1.1. One register and retrieve', () => {
    const user = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });

    const res = GET(userProfilePATH, {
      token: BODY(user).token,
      uId: BODY(user).authUserId,
    });

    expect(res.statusCode).toBe(OK);
    expect(BODY(res)).toMatchObject({
      user: {
        uId: BODY(user).authUserId,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Smith',
        handleStr: 'haydensmith',
      },
    });
  });
  test('1.2. Two users, one gets the other', () => {
    const user1 = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    const user2 = POST(authRegisterPATH, {
      email: 'anotheremail@yahoo.com',
      password: 'letters67',
      nameFirst: 'Bill',
      nameLast: 'Harvey',
    });

    const res = GET(userProfilePATH, {
      token: BODY(user1).token,
      uId: BODY(user2).authUserId,
    });

    expect(res.statusCode).toBe(OK);
    expect(BODY(res)).toMatchObject({
      user: {
        uId: BODY(user2).authUserId,
        email: 'anotheremail@yahoo.com',
        nameFirst: 'Bill',
        nameLast: 'Harvey',
        handleStr: 'billharvey'
      },
    });
  });
  test('1.3. 5 users, ask for two users', () => {
    const user1 = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    const user2 = POST(authRegisterPATH, {
      email: 'anotheremail@yahoo.com',
      password: 'letters67',
      nameFirst: 'Bill',
      nameLast: 'Harvey',
    });
    const user3 = POST(authRegisterPATH, {
      email: 'aperson@outlook.com',
      password: 'qwerty',
      nameFirst: 'Bob',
      nameLast: 'Marley',
    });
    const user4 = POST(authRegisterPATH, {
      email: 'student@unsw.com',
      password: 'zxcvbb',
      nameFirst: 'Sam',
      nameLast: 'Foo',
    });
    const user5 = POST(authRegisterPATH, {
      email: 'maybe@gmail.com',
      password: 'asdfdsfsdfg',
      nameFirst: 'Water',
      nameLast: 'Fire',
    });
    expect(user1.statusCode).toBe(OK);
    expect(user2.statusCode).toBe(OK);
    expect(user3.statusCode).toBe(OK);
    expect(user4.statusCode).toBe(OK);
    expect(user5.statusCode).toBe(OK);

    const res1 = GET(userProfilePATH, {
      token: BODY(user2).token,
      uId: BODY(user4).authUserId,
    });

    const res2 = GET(userProfilePATH, {
      token: BODY(user5).token,
      uId: BODY(user3).authUserId,
    });

    expect(res1.statusCode).toBe(OK);
    expect(res2.statusCode).toBe(OK);
    expect(BODY(res1)).toMatchObject({
      user: {
        uId: BODY(user4).authUserId,
        email: 'student@unsw.com',
        nameFirst: 'Sam',
        nameLast: 'Foo',
        handleStr: 'samfoo'
      },
    });

    expect(res2.statusCode).toBe(OK);
    expect(BODY(res2)).toMatchObject({
      user: {
        uId: BODY(user3).authUserId,
        email: 'aperson@outlook.com',
        nameFirst: 'Bob',
        nameLast: 'Marley',
        handleStr: 'bobmarley'
      },
    });
  });
});

describe('2. Invalid Parameters', () => {
  test('2.1. Invalid token', () => {
    const user1 = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    const user2 = POST(authRegisterPATH, {
      email: 'anotheremail@yahoo.com',
      password: 'letters67',
      nameFirst: 'Bill',
      nameLast: 'Harvey',
    });
    expect(user1.statusCode).toBe(OK);
    expect(user2.statusCode).toBe(OK);

    const res = GET(userProfilePATH, {
      token: 'invalidToken',
      uId: BODY(user2).authUserId,
    });

    expect(res.statusCode).toBe(FORBIDDEN);
  });
  test('2.2. Invalid userId', () => {
    const user1 = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    const user2 = POST(authRegisterPATH, {
      email: 'anotheremail@yahoo.com',
      password: 'letters67',
      nameFirst: 'Bill',
      nameLast: 'Harvey',
    });
    expect(user1.statusCode).toBe(OK);
    expect(user2.statusCode).toBe(OK);

    const res = GET(userProfilePATH, {
      token: BODY(user1).token,
      uId: -99999,
    });

    expect(res.statusCode).toBe(BAD_REQUEST);
  });
  test('2.3. Invalid authID and userId', () => {
    const user1 = POST(authRegisterPATH, {
      email: 'example@gmail.com',
      password: 'pass123',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });
    const user2 = POST(authRegisterPATH, {
      email: 'anotheremail@yahoo.com',
      password: 'letters67',
      nameFirst: 'Bill',
      nameLast: 'Harvey',
    });
    expect(user1.statusCode).toBe(OK);
    expect(user2.statusCode).toBe(OK);

    const res = GET(userProfilePATH, {
      token: 'invalidToken',
      uId: -99999,
    });

    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
