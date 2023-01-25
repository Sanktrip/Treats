import { 
  POST, GET, DELETE, BODY,
  clearPATH,
  userProfileUploadImgPATH,
  userProfilePATH
} from './httpRequestsV1';
import { url, port } from '../config.json';

// ===== STANDARD OPERATIONS ====== //
import { 
  registerUser, createChannel, createDm, sendDmMessage, sendMessage, getDmMessage, getMessage, joinChannel, sendLater, removeMessage
} from './standardOperations';

// ===== STANDARD OUTPUT ===== //
const OK = 200;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const imgUrl = 'http://i.kym-cdn.com/photos/images/facebook/001/557/358/73b.jpg'
const DEFAULT_PROFILE_URL = `${url}:${port}/profileImgs/default.jpg`;

// ===== TESTS ===== //
beforeEach(() => {
  DELETE(clearPATH, {});
});


describe('testing correct functionality', () => {
  jest.setTimeout(10000);
  test('testing function executes without error', () => {

    // register user
    const user1 = registerUser(1);

    // user2 sends message later
    const profileResponse = POST(userProfileUploadImgPATH, {
      token: user1.token,
      imgUrl: imgUrl,
      xStart: 180,
      yStart: 235,
      xEnd: 745,
      yEnd: 820
    });
    expect(profileResponse.statusCode).toBe(OK);

    // check the user's imgUrl updated'
    const profile1 = GET(userProfilePATH, {
      token: user1.token,
      uId: user1.authUserId
    });
    expect(profile1.statusCode).toBe(OK);
    // console.log(BODY(profile1).user);
    // console.log(DEFAULT_PROFILE_URL);
    // console.log(BODY(profile1).user.profileImgUrl);
    expect(BODY(profile1).user.profileImgUrl).not.toEqual(DEFAULT_PROFILE_URL);

    const getProfileImg = GET(BODY(profile1).user.profileImgUrl, {});
    expect(getProfileImg.statusCode);
  });
});
describe('testing errors', () => {
  jest.setTimeout(10000);
  test('invalid imgUrl', () => {

    // register user
    const user1 = registerUser(1);

    // update profile pic
    let profileResponse = POST(userProfileUploadImgPATH, {
      token: user1.token,
      imgUrl: 'bflibfghjlnbdsj',
      xStart: 180,
      yStart: 235,
      xEnd: 745,
      yEnd: 820
    });
    expect(profileResponse.statusCode).toBe(BAD_REQUEST);

    // update profile pic
    profileResponse = POST(userProfileUploadImgPATH, {
      token: user1.token,
      imgUrl: 'eelslap.com',
      xStart: 180,
      yStart: 235,
      xEnd: 745,
      yEnd: 820
    });
  expect(profileResponse.statusCode).toBe(BAD_REQUEST);
  });
  jest.setTimeout(10000);
  test('invalid x/y values', () => {

    // register user
    const user1 = registerUser(1);

    // user2 sends message later
    var profileResponse = POST(userProfileUploadImgPATH, {
      token: user1.token,
      imgUrl: imgUrl,
      xStart: 1080,
      yStart: 235,
      xEnd: 745,
      yEnd: 82
    });
    expect(profileResponse.statusCode).toBe(BAD_REQUEST);

    // user2 sends message later
    profileResponse = POST(userProfileUploadImgPATH, {
      token: user1.token,
      imgUrl: imgUrl,
      xStart: 180,
      yStart: 235,
      xEnd: 17045,
      yEnd: 820
    });
    expect(profileResponse.statusCode).toBe(BAD_REQUEST);
  });
});