// @ts-nocheck

import { GET, POST, BODY, DELETE, channelDetailsPATH, userProfilePATH } from './httpRequestsV1';
import { authRegisterPATH, clearPATH, channelsCreatePATH } from './httpRequestsV1';

const FORBIDDEN = 403;

beforeEach(() => {
  DELETE(clearPATH, {});
});

const email = 'mrCool@gmail.com';
const password = 'password123456541';
const nameFirst = 'Garry';
const nameLast = 'Koo';
const email2 = 'flameo.hotman12@gmail.com';
const password2 = 'password123456541';
const nameFirst2 = 'Mr';
const nameLast2 = 'Char';
const channelName = 'mega_Channel';

describe('test handling missing data', () => {
  test('correct input structure with no data', () => {
    let result = GET(channelDetailsPATH, {
      token: '',
      channelId: '',
    });

    expect(result.statusCode).toBe(FORBIDDEN);
  });
}); /*
  test('no data in datafile', () => {
    const result = channelDetailsV1('authUserId', 'channelId');
    expect(result).toMatchObject(ERROR);
  });
  test('no passed data for channelId', () => {
    const email = 'mrCool@gmail.com';
    const password = 'password123456541';
    const nameFirst = 'Garry';
    const nameLast = 'Koo';
    const authUserId = authRegisterV1(email, password, nameFirst, nameLast);
    const channelName = 'mega_Channel';
    const isPublic = true;
    const channelId = channelsCreateV1(authUserId, channelName, isPublic);
    const result = channelDetailsV1(authUserId, '');
    expect(result).toMatchObject(ERROR);
  });
  test('no passed data for authUserId', () => {
    const email = 'mrCool@gmail.com';
    const password = 'password123456541';
    const nameFirst = 'Garry';
    const nameLast = 'Koo';
    const authUserId = authRegisterV1(email, password, nameFirst, nameLast);
    const channelName = 'mega_Channel';
    const isPublic = true;
    const channelId = channelsCreateV1(authUserId, channelName, isPublic);
    const result = channelDetailsV1('', channelId);
    expect(result).toMatchObject(ERROR);
  });
});
<<<<<<< HEAD
*/

describe('test the function works when everything is right', () => {
  test('test only owner - other no members', () => {
    // register user
    let user = POST(authRegisterPATH, {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    });
    // let authUserId, token = BODY(result);
    // console.log(user);
    user = BODY(user);
    // console.log(user)

    // register channel
    const isPublic = true;
    let result = POST(channelsCreatePATH, {
      token: user.token,
      name: channelName,
      isPublic: isPublic,
    });
    const channelId = BODY(result).channelId;
    // console.log(channelId);

    // test function
    result = GET(channelDetailsPATH, {
      token: user.token,
      channelId: channelId,
    });
    result = BODY(result);
    // console.log(result);
    // const authUserId = user.authUserId;
    // console.log(getData().users);
    // console.log(getData().channels);
    // console.log(`authUser: ${authUserId}, channelId: ${channelId}`)
    let member = BODY(GET(userProfilePATH, { token: user.token, uId: user.authUserId }));
    // console.log(member);
    member = [member.user];
    // console.log(member)

    expect(result).toStrictEqual({
      name: channelName,
      isPublic: isPublic,
      ownerMembers: member,
      allMembers: member,
    });
  });
  // TODO: add more / uncomment tests when channel/add/v2 implemented
  /*
  test('test when there are multiple members', () => {
    // register users
    const email = 'mrCool@hotmail.com';
    const password = 'password123456541';
    const nameFirst = 'Garry';
    const nameLast = 'Koo';
    const authUserId1 = authRegisterV1(email, password, nameFirst, nameLast).authUserId;
    const email2 = 'flameo.hotman12@gmail.com';
    const password2 = 'password123456541';
    const nameFirst2 = 'Mr';
    const nameLast2 = 'Char';
    const authUserId2 = authRegisterV1(email2, password2, nameFirst2, nameLast2).authUserId;

    // register channel
    const channelName = 'mega_Channel';
    const isPublic = true;
    const channelId = channelsCreateV1(authUserId1, channelName, isPublic).channelId;

    // add other user to the channel
    const joinMessage = channelJoinV1(authUserId2, channelId);

    // test function
    const result = channelDetailsV1(authUserId2, channelId);
    // console.log(result);
    // console.log(getData().users);
    // console.log(getData().channels);
    // console.log(`authUser: ${authUserId}, channelId: ${channelId}`)

    result.allMembers = new Set(result.allMembers);

    expect(result).toMatchObject({
      name: channelName,
      isPublic: isPublic,
      ownerMembers: [userProfileV2(authUserId1, authUserId1).user],
      allMembers: new Set([userProfileV2(authUserId1, authUserId1).user, userProfileV2(authUserId2, authUserId2).user]),
    });
  });
});

/*
describe('test when user is unauthorised', () => {
  test('user not in channel', () => {
    // register users
    const email = 'mrCool@hotmail.com';
    const password = 'password123456541';
    const nameFirst = 'Garry';
    const nameLast = 'Koo';
    const authUserId1 = authRegisterV1(email, password, nameFirst, nameLast).authUserId;
    const email2 = 'flameo.hotman12@gmail.com';
    const password2 = 'password123456541';
    const nameFirst2 = 'Mr';
    const nameLast2 = 'Char';
    const authUserId2 = authRegisterV1(email2, password2, nameFirst2, nameLast2).authUserId;

    // register channel
    const channelName = 'mega_Channel';
    const isPublic = true;
    const channelId = channelsCreateV1(authUserId1, channelName, isPublic).channelId;

    // don't add other user to the channel

    // test function
    const result = channelDetailsV1(authUserId2, channelId);
    // console.log(result);
    // console.log(getData().users);
    // console.log(getData().channels);
    // console.log(`authUser: ${authUserId}, channelId: ${channelId}`)
    expect(result).toMatchObject(ERROR);
  }); */
});
