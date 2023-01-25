// @ts-nocheck
import {
  GET, BODY, DELETE, POST,
  clearPATH, authRegisterPATH, dmCreatePATH, dmDetailsPATH, messageSendDmPATH, dmMessagesPATH,
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

// TESTS
beforeEach(() => {
  DELETE(clearPATH, {});
});

describe('correct functionality', () => {
  test('check endpoint available', () => {
    // register owner
    let user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });
    user = BODY(user);

    // register member
    let user2 = POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    });
    user2 = BODY(user2);

    // create DM
    let dmId = POST(dmCreatePATH, {
      token: user.token,
      uIds: [user2.authUserId],
    });
    dmId = BODY(dmId).dmId;

    const message = 'Wazzup my homies';
    // send message to DM
    let messageID = POST(messageSendDmPATH, {
      token: user.token,
      dmId: dmId,
      message: message,
    });
    messageID = BODY(messageID).messageID;

    const response = GET(dmMessagesPATH, {
      token: user.token,
      dmId: dmId,
      start: 0,
    });

    // console.log("response: ");
    // console.log(BODY(response));
    const returnMessage = BODY(response).messages[0].message;
    // console.log(`Message: '${returnMessage}'`);

    expect(response.statusCode).toBe(OK);
    expect(returnMessage).toStrictEqual(message);
  });

  test('test lots of messages', () => {
    // register owner
    let user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });
    user = BODY(user);

    // register member
    let user2 = POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    });
    user2 = BODY(user2);

    // create DM
    let dmId = POST(dmCreatePATH, {
      token: user.token,
      uIds: [user2.authUserId],
    });
    dmId = BODY(dmId).dmId;

    // send messages to DM
    for (let messageNum = 0; messageNum < 75; messageNum++) {
      POST(messageSendDmPATH, {
        token: user.token,
        dmId: dmId,
        message: messageNum.toString(),
      });
    }

    // get the first 50 messages
    let response = GET(dmMessagesPATH, {
      token: user.token,
      dmId: dmId,
      start: 0,
    });

    // test first response
    expect(response.statusCode).toBe(OK);
    response = BODY(response);
    const returnMessage = response.messages[0].message;
    expect(returnMessage).toStrictEqual('74');
    expect(response.start).toStrictEqual(0);
    expect(response.end).toStrictEqual(50);
    expect(response.messages[49].message).toStrictEqual('25');

    // get the 25 remaining messages
    response = GET(dmMessagesPATH, {
      token: user.token,
      dmId: dmId,
      start: response.end,
    });

    // test second response
    expect(response.statusCode).toBe(OK);
    response = BODY(response);
    expect(response.messages[0].message).toStrictEqual('24');
    expect(response.start).toStrictEqual(50);
    expect(response.end).toStrictEqual(-1);
    expect(response.messages.length).toStrictEqual(25);
    expect(response.messages[24].message).toStrictEqual('0');
  });
});

describe('errors', () => {
  test('test when dmID not valid', () => {
    // register owner
    let user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });
    user = BODY(user);

    // register member
    let user2 = POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    });
    user2 = BODY(user2);

    // create DM
    let dmId = POST(dmCreatePATH, {
      token: user.token,
      uIds: [user2.authUserId],
    });
    dmId = BODY(dmId).dmId;

    const message = 'Wazzup my homies';
    // send message to DM
    let messageID = POST(messageSendDmPATH, {
      token: user.token,
      dmId: dmId,
      message: message,
    });
    messageID = BODY(messageID).messageID;

    // give a false dmId
    const response = GET(dmMessagesPATH, {
      token: user.token,
      dmId: dmId + 1,
      start: 0,
    });

    expect(response.statusCode).toBe(BAD_REQUEST);
  });

  test('test when start is greater than the total number of messages in the channel', () => {
    // register owner
    let user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });
    user = BODY(user);

    // register member
    let user2 = POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    });
    user2 = BODY(user2);

    // create DM
    let dmId = POST(dmCreatePATH, {
      token: user.token,
      uIds: [user2.authUserId],
    });
    dmId = BODY(dmId).dmId;

    const message = 'Wazzup my homies';
    // send message to DM
    let messageID = POST(messageSendDmPATH, {
      token: user.token,
      dmId: dmId,
      message: message,
    });
    messageID = BODY(messageID).messageID;

    // set start to be past the end of the dm's messages
    const response = GET(dmMessagesPATH, {
      token: user.token,
      dmId: dmId,
      start: 7,
    });

    expect(response.statusCode).toBe(BAD_REQUEST);
  });

  test('test when authorised user is not a member of the DM', () => {
    // register owner
    let user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });
    user = BODY(user);

    // register member
    let user2 = POST(authRegisterPATH, {
      email: email2,
      password: password2,
      nameFirst: nameFirst2,
      nameLast: nameLast2,
    });
    user2 = BODY(user2);

    // register non-member
    let user3 = POST(authRegisterPATH, {
      email: email3,
      password: password3,
      nameFirst: nameFirst3,
      nameLast: nameLast3,
    });
    user3 = BODY(user3);

    // create DM
    let dmId = POST(dmCreatePATH, {
      token: user.token,
      uIds: [user2.authUserId],
    });
    dmId = BODY(dmId).dmId;

    const message = 'Wazzup my homies';
    // send message to DM
    let messageID = POST(messageSendDmPATH, {
      token: user.token,
      dmId: dmId,
      message: message,
    });
    messageID = BODY(messageID).messageID;

    // give the user token of a non-member
    const response = GET(dmMessagesPATH, {
      token: user3.token,
      dmId: dmId,
      start: 0,
    });

    expect(response.statusCode).toBe(FORBIDDEN);
  });
});
