import { GET, POST, BODY, DELETE } from './httpRequestsV1';
import { userStatsPATH, usersStatsPATH } from './httpRequestsV1';
import { authRegisterPATH, userProfilePATH, usersAllPATH, clearPATH } from './httpRequestsV1';
import * as standardOps from './standardOperations';


// STANDARD OUTPUTS
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

/**
 * 1. Expected behaviour
 * 2. Error checking ???
 * 3. Edge cases
 * 
 * server stats tests can be moved to usersStatsV1.test.ts
 * 
 * dont need a lot of tests due to pipeline taking too long
 * just do tests that cover everything
*/

// cleanup before each test
// this techinically is testing resetLogs function
beforeEach(() => {
  DELETE(clearPATH, {});
});

/**
 * REVAMP testing to do less tests, but more in a single test
 * we need coverage at least
 * 
 * 1. user just created, checks stats
 * 2. user has create a channel
 * 3. user created a dm
 * 4. user sends a message (both dm and server)
 * 5. user creates dm, channel and sends a message on each
 * 6. users leave/remove dm
 * 7. user leaves channel
 * 
 * new tests
 * 1. user just created, checks stats
 * 2. two users, create channel and dm, each send one/two message(s)
 * 3. 3 users, create 2 dms and a channel, send, edit and remove messages
 * 4. 5 users, create channels and dms, send, remove and standup messages, remove dms/leave channels
 * 5. idk anything else
 * 
 * 
 * for now, its one test
 * 
 */

describe('userStats and usersStats test', () => {
  test('general usage', () => {
    let user1 = standardOps.registerUser(1);
    let user2 = standardOps.registerUser(2);
    let user3 = standardOps.registerUser(3);
    let user4 = standardOps.registerUser(4);
    let user5 = standardOps.registerUser(5);

    let channel1 = standardOps.createChannel(user1.token); // may fail here
    let channel2 = standardOps.createChannel(user3.token); // may fail here

    let idArry1 = [user2.authUserId, user3.authUserId];
    let idArry2 = [user2.authUserId, user3.authUserId, user4.authUserId];

    let dm1 = standardOps.createDm(user1.token, idArry1); // can fail here
    let dm2 = standardOps.createDm(user5.token, idArry2); // can fail here

    standardOps.joinChannel(user2.token, channel2);

    let messageC1 = standardOps.sendMessage(user1.token, channel1, 'Test messageC1');
    let messageC2 = standardOps.sendMessage(user2.token, channel2, 'Test messageC2');


    let messageD1 = standardOps.sendDmMessage(user1.token, dm1, 'Test messageD1');
    let messageD2 = standardOps.sendDmMessage(user2.token, dm2, 'Test messageD2');


    let stat1 = GET(userStatsPATH, {
      token: user1.token
    }); //user1 and need to pass tokens as well
    let stat2 = GET(userStatsPATH, {
      token: user2.token
    }); // user2
    let sStat1 = GET(usersStatsPATH, {
      token: user1.token
    });
    expect(BODY(stat1).userStats).toStrictEqual({
      channelsJoined: [
        { numChannelsJoined: 0, timeStamp: 0 }, 
        { numChannelsJoined: 1, timeStamp: expect.any(Number) }
      ],
      dmsJoined: [
        { numDmsJoined: 0, timeStamp: 0 }, 
        { numDmsJoined: 1, timeStamp: expect.any(Number) }
      ],
      messagesSent: [
        {numMessagesSent: 0, timeStamp: 0}, 
        {numMessagesSent: 1, timeStamp: expect.any(Number)}, 
        {numMessagesSent: 2, timeStamp: expect.any(Number)}
      ],
      involvementRate: expect.any(Number)
    });
    expect(BODY(sStat1).workspaceStats).toStrictEqual({
      channelsExist: [
        {numChannelsExist: 0, timeStamp: 0}, 
        {numChannelsExist: 1, timeStamp: expect.any(Number)},
        {numChannelsExist: 2, timeStamp: expect.any(Number)}
      ],
      dmsExist: [
        {numDmsExist: 0, timeStamp: 0}, 
        {numDmsExist: 1, timeStamp: expect.any(Number)},
        {numDmsExist: 2, timeStamp: expect.any(Number)},
      ],
      messagesExist: [
        {numMessagesExist: 0, timeStamp: 0}, 
        {numMessagesExist: 1, timeStamp: expect.any(Number)}, 
        {numMessagesExist: 2, timeStamp: expect.any(Number)},
        {numMessagesExist: 3, timeStamp: expect.any(Number)},
        {numMessagesExist: 4, timeStamp: expect.any(Number)}
      ],
      utilizationRate: expect.any(Number)
    });

    standardOps.removeMessage(user1.token, messageC1);

    stat1 = GET(userStatsPATH, {
      token: user1.token
    }); //user1
    stat2 = GET(userStatsPATH, {
      token: user2.token
    }); // user2
    sStat1 = GET(usersStatsPATH, {
      token: user1.token
    });

    expect(BODY(stat1).userStats).toStrictEqual({
      channelsJoined: [
        {numChannelsJoined: 0, timeStamp: 0}, 
        {numChannelsJoined: 1, timeStamp: expect.any(Number)}],
      dmsJoined: [
        {numDmsJoined: 0, timeStamp: 0}, 
        {numDmsJoined: 1, timeStamp: expect.any(Number)}],
      messagesSent: [
        {numMessagesSent: 0, timeStamp: 0}, 
        {numMessagesSent: 1, timeStamp: expect.any(Number)}, 
        {numMessagesSent: 2, timeStamp: expect.any(Number)}
      ],
      involvementRate: expect.any(Number)
    });
    expect(BODY(sStat1).workspaceStats).toStrictEqual({
      channelsExist: [
        {numChannelsExist: 0, timeStamp: 0}, 
        {numChannelsExist: 1, timeStamp: expect.any(Number)},
        {numChannelsExist: 2, timeStamp: expect.any(Number)}
      ],
      dmsExist: [
        {numDmsExist: 0, timeStamp: 0}, 
        {numDmsExist: 1, timeStamp: expect.any(Number)},
        {numDmsExist: 2, timeStamp: expect.any(Number)}
      ],
      messagesExist: [
        {numMessagesExist: 0, timeStamp: 0}, 
        {numMessagesExist: 1, timeStamp: expect.any(Number)}, 
        {numMessagesExist: 2, timeStamp: expect.any(Number)}, 
        {numMessagesExist: 3, timeStamp: expect.any(Number)},
        {numMessagesExist: 4, timeStamp: expect.any(Number)},
        {numMessagesExist: 3, timeStamp: expect.any(Number)}
      ],
      utilizationRate: expect.any(Number)
    });
  });
});



/*
describe('1. General Tests', () => {
  test('1.1. New user, checks stats', () => {
    let user1 = standardOps.registerUser(2);
    let stat1 = GET(userStatsPATH);
    let sStat1 = GET(usersStatsPATH);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}],
        dmsJoined: [{0, 0}],
        messagesSent: [{0, 0}],
        involvementRate: 0
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}],
        dmsExist: [{0, 0}],
        messagesExist: [{0, 0}],
        utilizationRate: 0
      }
    );
  });
  test('1.2. two users, create channel and dm, each send one/two message(s), remove a message', () => {
    let user1 = standardOps.registerUser(2);
    let user2 = standardOps.registerUser(2);
    let channel1 = standardOps.createChannel(user1.token); // may fail here
    let dm1 = standardOps.createDm(user1.token, user2.authUserId); // can fail here
    let messageC1 = standardOps.sendMessage(user1.token, channel1.Id, 'Test messageC1');
    let messageD1 = standardOps.sendDmMessage(user1.token, dm1.Id, 'Test messageD1');
    let messageC2 = standardOps.sendMessage(user2.token, channel1.Id, 'Test messageC2');
    let messageD2 = standardOps.sendDmMessage(user1.token, dm1.Id, 'Test messageD2');
    let stat1 = GET(userStatsPATH); //user1
    let stat2 = GET(userStatsPATH); // user2
    let sStat1 = GET(usersStatsPATH);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}, {1, expect.any(Number)}],
        dmsJoined: [{0, 0}, {1, expect.any(Number)}],
        messagesSent: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}],
        involvementRate: expect.any(Number)
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}, {1, expect.any(Number)}],
        dmsExist: [{0, 0}, {1, expect.any(Number)}],
        messagesExist: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}],
        utilizationRate: expect.any(Number)
      }
    );
    standardOps.messageRemove(user1.token, messageC1.Id);
    stat1 = GET(userStatsPATH); //user1
    stat2 = GET(userStatsPATH); // user2
    sStat1 = GET(usersStatsPATH);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}, {1, expect.any(Number)}],
        dmsJoined: [{0, 0}, {1, expect.any(Number)}],
        messagesSent: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}, {1, expect.any(Number)}],
        involvementRate: expect.any(Number)
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}, {1, expect.any(Number)}],
        dmsExist: [{0, 0}, {1, expect.any(Number)}],
        messagesExist: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}, {1, expect.any(Number)}],
        utilizationRate: expect.any(Number)
      }
    );
  });
  });
  test('1.7. user leaves channel', () => {

  });
  test('1.2. Replaced with above: New user, creates channel', () => {
    let user1 = standardOps.registerUser(2);
    let channel1 = standardOps.createChannel(user1.token); // may fail here
    let stat1 = GET(userStatsPATH);
    let sStat1 = GET(usersStatsPATH);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}, {1, expect.any(Number)}],
        dmsJoined: [{0, 0}],
        messagesSent: [{0, 0}],
        involvementRate: expect.any(Number)
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}, {1, expect.any(Number)}],
        dmsExist: [{0, 0}],
        messagesExist: [{0, 0}],
        utilizationRate: expect.any(Number)
      }
    );
  });
  test('1.3. user creates dm', () => {
    let user1 = standardOps.registerUser(2);
    let user2 = standardOps.registerUser(2);
    let dm1 = standardOps.createDm(user1.token, user2.authUserId); // can fail here
    let stat1 = GET(userStatsPATH);
    let sStat1 = GET(usersStatsPATH);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}],
        dmsJoined: [{0, 0}, {1, expect.any(Number)}],
        messagesSent: [{0, 0}],
        involvementRate: expect.any(Number)
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}],
        dmsExist: [{0, 0}, {1, expect.any(Number)}],
        messagesExist: [{0, 0}],
        utilizationRate: expect.any(Number)
      }
    );
  });
  test('1.4. user sends a message (both dm and server)', () => {
    let user1 = standardOps.registerUser(2);
    let user2 = standardOps.registerUser(2);
    let channel1 = standardOps.createChannel(user1.token); // may fail here
    let dm1 = standardOps.createDm(user1.token, user2.authUserId); // can fail here
    let messageC1 = standardOps.sendMessage(user1.token, channel1.Id, 'Test messageC1');
    let messageD1 = standardOps.sendDmMessage(user1.token, dm1.Id, 'Test messageD1');

    let stat1 = GET(userStatsPATH);
    let sStat1 = GET(usersStatsPATH);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}, {1, expect.any(Number)}],
        dmsJoined: [{0, 0}, {1, expect.any(Number)}],
        messagesSent: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}],
        involvementRate: expect.any(Number)
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}, {1, expect.any(Number)}],
        dmsExist: [{0, 0}, {1, expect.any(Number)}],
        messagesExist: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}],
        utilizationRate: expect.any(Number)
      }
    );
  });
  test('1.5. user removes message', () => {
    let user1 = standardOps.registerUser(2);
    let user2 = standardOps.registerUser(2);
    let channel1 = standardOps.createChannel(user1.token); // may fail here
    let dm1 = standardOps.createDm(user1.token, user2.authUserId); // can fail here
    let messageC1 = standardOps.sendMessage(user1.token, channel1.Id, 'Test messageC1');
    let messageD1 = standardOps.sendDmMessage(user1.token, dm1.Id, 'Test messageD1');

    let stat1 = GET(userStatsPATH);
    let sStat1 = GET(usersStatsPATH);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}, {1, expect.any(Number)}],
        dmsJoined: [{0, 0}, {1, expect.any(Number)}],
        messagesSent: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}],
        involvementRate: expect.any(Number)
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}, {1, expect.any(Number)}],
        dmsExist: [{0, 0}, {1, expect.any(Number)}],
        messagesExist: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}],
        utilizationRate: expect.any(Number)
      }
    );
    standardOps.messageRemove(user1.token, messageC1.Id);
    expect(stat1).toStrictEqual(
      {
        channelsJoined: [{0, 0}, {1, expect.any(Number)}],
        dmsJoined: [{0, 0}, {1, expect.any(Number)}],
        messagesSent: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}, {1, expect.any(Number)}],
        involvementRate: expect.any(Number)
      }
    );
    expect(sStat1).toStrictEqual(
      {
        channelsExist: [{0, 0}, {1, expect.any(Number)}],
        dmsExist: [{0, 0}, {1, expect.any(Number)}],
        messagesExist: [{0, 0}, {1, expect.any(Number)}, {2, expect.any(Number)}, {1, expect.any(Number)}],
        utilizationRate: expect.any(Number)
      }
    );
  });
  test('1.6. users leave/remove dm', () => {

  });
  test('1.7. user leaves channel', () => {

  });
});
*/