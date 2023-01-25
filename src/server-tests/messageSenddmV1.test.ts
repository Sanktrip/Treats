import {
  GET, BODY, DELETE, POST,
  clearPATH, authRegisterPATH, dmCreatePATH, dmDetailsPATH, messageSendDmPATH
} from './httpRequestsV1';

// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

const email = 'mrCool@gmail.com';
const password = 'password123456541';
const nameFirst = 'Garry';
const nameLast = 'Koo';
const email2 = 'flameo.hotman12@gmail.com';
const password2 = 'password123456541';
const nameFirst2 = 'Mr';
const nameLast2 = 'Char';
const email3 = 'theReel.boris@gmail.com';
const password3 = 'qwerty';
const nameFirst3 = 'Borris';
const nameLast3 = 'Johnson';
const MESSAGE_LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam condimentum nibh in porta dignissim. Sed elit lectus, vestibulum eget porttitor luctus, ullamcorper ac dolor. Suspendisse potenti. In hac habitasse platea dictumst. Aenean nulla tortor, maximus ac dui a, rutrum congue ex. Aliquam et consectetur nunc. Aenean a est leo. Donec ex justo, laoreet ut libero at, rhoncus mattis neque. Donec tellus tellus, convallis in rhoncus ut, ullamcorper id arcu. Cras eget lectus non sem congue pulvinar vel quis nulla. Pellentesque et pulvinar odio. Donec fringilla massa ac turpis porta, et viverra purus rhoncus. Nam ornare magna sit amet arcu convallis, at varius lorem dignissim. Curabitur maximus in tellus in pharetra. Phasellus interdum condimentum tellus, vitae suscipit massa. Proin eu tortor tincidunt, maximus augue sit amet, laoreet ipsum. Suspendisse potenti. Donec imperdiet eros ac lorem vestibulum scelerisque ut vehicula felis. Praesent quis lorem odio. Cras consectetur nunc in urna venenatis laoreet. Fusce non consectetur dolor, efficitur bibendum lorem.';

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('correct functionality', () => {
  test('check endpoint available', () => {
    // register owner
    const user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });
    expect(user.statusCode).toBe(OK);

    // register member
    const user2 = POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    });
    expect(user2.statusCode).toBe(OK);

    // create DM
    const dmId = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId],
    });
    expect(dmId.statusCode).toBe(OK);

    // send message to DM
    const messageID = POST(messageSendDmPATH, {
      token: BODY(user).token,
      dmId: BODY(dmId).dmId,
      message: 'Wazzup my homies',
    });

    expect(messageID.statusCode).toBe(OK);
  });
});

describe('testing errors', () => {
  test('dmId does not refer to valid DM', () => {
    // register owner
    const user = BODY(POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    }));

    // register member
    const user2 = BODY(POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    }));

    // do not create DM
    const dmId = 0;
    // send message to DM
    const messageID = POST(messageSendDmPATH, {
      token: user.token,
      dmId: dmId,
      message: 'Wazzup my homies',
    });
    expect(messageID.statusCode).toBe(BAD_REQUEST);
  });

  test('Length is not between 1 and 1000 characters (inclusive)', () => {
    // register owner
    const user = BODY(POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    }));

    // register member
    const user2 = BODY(POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    }));

    // create DM
    const dmId = BODY(POST(dmCreatePATH, {
      token: user.token,
      uIds: [user2.authUserId],
    })).dmId;

    // send message to DM
    const messageID1 = POST(messageSendDmPATH, {
      token: user.token,
      dmId: dmId.dmId,
      message: '',
    });
    expect(messageID1.statusCode).toBe(BAD_REQUEST);

    // send message to DM
    const messageID2 = POST(messageSendDmPATH, {
      token: user.token,
      dmId: dmId,
      message: MESSAGE_LONG,
    });
    expect(messageID2.statusCode).toBe(BAD_REQUEST);
  });

  test('authorised user is not a member of the DM', () => {
    // register owner
    const user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });

    // register member
    const user2 = POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    });

    // register non-member
    const user3 = POST(authRegisterPATH, {
      email: email3,
      password: password3,
      nameFirst: nameFirst3,
      nameLast: nameLast3,
    });

    // create DM
    const dmId = POST(dmCreatePATH, {
      token: BODY(user).token,
      uIds: [BODY(user2).authUserId],
    });

    // send message to DM
    const messageID = POST(messageSendDmPATH, {
      token: BODY(user3).token,
      dmId: BODY(dmId).dmId,
      message: 'ahoy maties',
    });
    expect(messageID.statusCode).toBe(FORBIDDEN);
  });
});
