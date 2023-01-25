import HTTPError from 'http-errors';

import {
  getData, setData,
  dataTYPE, messageTYPE, channelTYPE, userTYPE,
  GLOBAL_OWNER
} from './dataStore';

import {
  userProfileV2,
  userProfile
} from './users';

import { validateUser } from './auth';

import { validateChannel } from './channels';

import { validateToken } from './tokens';

import { notifyChannelInvited } from './notifications';
import { getTimestamp } from './message';
import { updateUserlog } from './log';

// HTTP errors
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// channelMessagesV1 return type
interface channelMessages {
  messages: messageTYPE[],
  start: number,
  end: number
}
// channelDetailsV1 return type
interface channelDetails {
  name: string,
  isPublic: boolean,
  ownerMembers: userProfile[],
  allMembers: userProfile[],
}

/**
 * given a userId, a channelId and an Id of an invited user, let the user invite another user to the channel
 *
 * ARGUMENTS:
 * @param {string} token of a registered user
 * @param {integer} channelId of a created channel
 * @param {integer} uId of an invitied user
 *
 * RETURN VALUES:
 * @returns { {} } upon successful invitation
 *
 * ERRORS:
 * @throws {403} if the token is invalid
 * @throws {400} if channelId does not exist
 * @throws {403} authUserId is not a member of the channel
 * @throws {400} uId is invalid
 * @throws {400} uId is already a member of channel
*/
function channelInviteV1(token: string, channelId: number, uId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // check if channelId exist in datastore; if not, throw BAD_REQUEST
  validateChannel(channelId);

  const channel = dataStore.channels.filter(channel => channel.channelId === channelId)[0];

  // check whether authorised user is a member
  if (!(channel.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'inviter is not part of the channel');
  }

  // check whether authUserId and uId is valid or not
  if (validateUser(uId) === false) {
    throw HTTPError(BAD_REQUEST, 'invalid user id');
  }

  // check whether uId is already a member or not
  if (channel.members.includes(uId)) {
    throw HTTPError(BAD_REQUEST, 'user is already a member');
  }

  channel.members.push(uId);

  setData(dataStore);

  notifyChannelInvited(token, uId, channelId);

  return {};
}

/**
 * given a user's Id and channel's Id, return details of the channel
 *
 * ARUGMENTS:
 * @param {string} token of user requesting details of channel
 * @param {integer} channelId of requested channel
 *
 * RETURN VALUES:
 * @returns { channelDetails } if no errors occur
 *
 * ERRORS:
 * @throws {403} if the token is invalid
 * @throws {400} if channel doesn't exist
 * @throws {403} user is not part of channel
 */
function channelDetailsV1(token: string, channelId: number): channelDetails {
  const authUserId = validateToken(token);

  // check the channel exists
  const channel = validateChannel(channelId);

  // check the user is part of the channel
  if (!((channel as channelTYPE).members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'user is not part of the channel');
  }

  // construct arrays of users to return
  const owners: userProfile[] = (channel as channelTYPE).owners.map((uId) => (userProfileV2(token, uId) as {user: userProfile}).user);
  const members: userProfile[] = (channel as channelTYPE).members.map((uId) => (userProfileV2(token, uId) as {user: userProfile}).user);

  return {
    name: (channel as channelTYPE).channelName,
    isPublic: (channel as channelTYPE).publicStatus,
    ownerMembers: owners,
    allMembers: members,
  };
}

/**
 * given an authUserId, channelId and start message index, returns object
 * containing an array of message objects, the start passed into the function
 * and the end index (either start + 50 or -1)
 *
 * ARGUMENTS:
 * @param {string} token Id of a registered user
 * @param {string} channelId Id of a created chgive cs1521 lab10_thread_chain thread_chain.cannel
 * @param {number} start starting message index in channel's messages array
 *
 * RETURN VALUES:
 * @returns {channelMessages} object containing messages array of channel, start index passed and end index
 *
 * ERRORS:
 * @throws {403} if the token is invalid
 * @throws {400} the channelId is invalid
 * @throws {403} authUserId is not a channel member
 * @throws {400} start > number of messages in channel
 */
function channelMessagesV1(token: string, channelId: number, start: number): channelMessages {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // iterates through channels, checks if channelId is valid
  const matchingChannels = dataStore.channels.filter(channel => channel.channelId === channelId);
  if (matchingChannels.length !== 1) {
    throw HTTPError(BAD_REQUEST, 'invalid channel id');
  }

  const subjectChannel = matchingChannels[0];
  const subjectMessages = subjectChannel.messages.map((messageId) => dataStore.messages.find(message => message.messageId === messageId)).filter(message => message.timeSent <= getTimestamp());

  // checks if authUser is part of channel
  if (!(subjectChannel).members.includes(authUserId)) {
    throw HTTPError(FORBIDDEN, 'user is not a member of the channel');
  }

  // checks if startPassed is valid
  // can see possible indexing issue here, need to test after iteration 1
  if (start < 0 || start > subjectMessages.length) {
    throw HTTPError(BAD_REQUEST, 'start > number of messages in channel');
  }

  // below needs proper testing after iteration 1
  let end: number;
  let messagesReturn: messageTYPE[] = []; // array returned with messages

  // checks if there are less than 50 messages after start index
  if (start + 50 >= subjectMessages.length) {
    end = -1;
  } else {
    end = start + 50;
  }

  // pushes messages from channel in return array
  for (let counter = 0; start + counter < subjectMessages.length; counter++) {
    messagesReturn.push(subjectMessages[start + counter]);
  }

  // sort messages by timestamp
  messagesReturn = messagesReturn.sort((a, b) => b.timeSent - a.timeSent);

  return {
    messages: messagesReturn,
    start: start,
    end: end,
  };
}

/**
 * given a userId and a channelId, let the user join the channel
 *
 * ARGUMENTS:
 * @param {number} token of a registered user
 * @param {number} channelId of a created channel
 *
 * RETURN VALUES:
 * @returns { {} } empty object, if user successfully joins channel
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if channel doesn't exist
 * @throws {400} user is already a member
 * @throws {403} channel is private and authUserId is not a global owner
*/
function channelJoinV1(token: string, channelId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // checks if user exists
  let user: userTYPE; // to store user details if user exists
  // let userExists = false;
  for (const userEmail in dataStore.users) {
    if (dataStore.users[userEmail].uId === authUserId) {
    //  userExists = true;
      user = dataStore.users[userEmail];
      break;
    }
  }

  // check if channelId exist in datastore,if not, return ERROR
  if (!(dataStore.channels.some((channel) => channel.channelId === channelId))) {
    throw HTTPError(BAD_REQUEST, 'invalid channel id');
  }

  // check whether authorised user is already a member
  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      // return error if user is already in channel
      if (channel.members.includes(authUserId)) {
        throw HTTPError(BAD_REQUEST, 'user is already in channel');
      }

      // check whether the channel is private and return ERROR when it is and the authorised user is not already a channel member and is not a global owner
      if (channel.publicStatus === false && user.globalPermission === 2) {
        throw HTTPError(FORBIDDEN, 'only global owners can join private channels');
      }

      channel.members.push(authUserId);
    }
  }

  setData(dataStore);

  updateUserlog('c', token);

  return {};
}

/**
 * Given a channel ID, the user is removed as a member of this channel.
 *
 * ARGUMENTS:
 * @param {string} token of the user calling the function
 * @param {number} channelId of the channel that the user wants to leave
 *
 * RETURN VALUES:
 * @returns { {} } if successful leave the channel
 *
 * ERRORS:
 * @throws {400} if channel does not exist
 * @throws {403} user is not part of the channel
 * TODO: 400 error when authorised user is the starter of an active standup in the channel
 */

function channelLeaveV1(token: string, channelId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // if channelId is invalid
  validateChannel(channelId);

  const channel = dataStore.channels.filter(channel => channel.channelId === channelId)[0];

  // channelId is valid but the authorised user is not a member of the channel
  // check whether authorised user is a member
  if (!(channel.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'user is not a channel member');
  }
  const standupChannel = dataStore.standup.filter(x => x.channelId === channelId)[0];
  if (standupChannel.creator === authUserId) {
    throw HTTPError(BAD_REQUEST, 'User is currently running a standup!');
  }
  channel.owners = channel.owners.filter(id => id !== authUserId);
  channel.members = channel.members.filter(id => id !== authUserId);

  setData(dataStore);

  updateUserlog('c', token);

  return {};
}

/**
 * Make user with user id uId an owner of the channel.
 *
 * ARGUMENTS:
 * @param {string} token of a registered user
 * @param {number} channelId of a created channel
 * @param {number} uId of an added user
 *
 * RETURN VALUES:
 * @returns { {} } upon successful invitation
 *
 * ERRORS:
 * @throws {400} if channelId does not exist
 * @throws {403} authorised user does not have owner permissions in the channel
 * @throws {400} uId is invalid
 * @throws {400} uId is not a member of channel
 * @throws {400} uId is already an owner of the channel
*/
function channelAddownerV1(token: string, channelId: number, uId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // check if channelId exist in datastore; if not, return ERROR
  validateChannel(channelId);

  // check whether authUserId and uId is valid or not
  if (validateUser(authUserId) === false || validateUser(uId) === false) {
    throw HTTPError(BAD_REQUEST, 'invalid user id');
  }

  const channel = dataStore.channels.filter(channel => channel.channelId === channelId)[0];

  // check whether authUserId has owner permissions
  const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
  if ((!(channel.owners.includes(authUserId))) && authUserGlobalPermissions !== GLOBAL_OWNER) {
    throw HTTPError(FORBIDDEN, 'calling user is not permitted to add owners');
  }

  // check whether uId is already a member or not
  if (!(channel.members.includes(uId))) {
    throw HTTPError(BAD_REQUEST, 'user is not a member of the channel');
  }

  // check whether uId is an owner
  if (channel.owners.includes(uId)) {
    throw HTTPError(BAD_REQUEST, 'user already an owner');
  }

  channel.owners.push(uId);

  setData(dataStore);
  return {};
}

/**
 * Remove user with user id uId as an owner of the channel.
 *
 * ARGUMENTS:
 * @param {string} token of a registered user
 * @param {number} channelId of a created channel
 * @param {number} uId of a removed user
 *
 * RETURN VALUES:
 * @returns { {} } upon successful invitation
 *
 * ERRORS:
 * @throws {400} if channelId does not exist
 * @throws {403} authorised user does not have owner permissions in the channel
 * @throws {400} if uId is invalid
 * @throws {400} uId is not a memeber of channel
 * @throws {400} uId refers to a user who is currently the only owner of the channel
*/
function channelRemoveownerV1(token: string, channelId: number, uId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // check if channelId exist in datastore; if not, return ERROR
  validateChannel(channelId);
  // check whether authUserId and uId is valid or not
  if (validateUser(authUserId) === false || validateUser(uId) === false) {
    throw HTTPError(BAD_REQUEST, 'invalid user id');
  }

  const channel = dataStore.channels.filter(channel => channel.channelId === channelId)[0];

  // check whether authUserId has owner permissions
  const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
  if ((!(channel.owners.includes(authUserId))) && authUserGlobalPermissions !== GLOBAL_OWNER) {
    throw HTTPError(FORBIDDEN, 'user does not have permission to remove owner');
  }

  // check whether uId is an owner
  if (!(channel.owners.includes(uId))) {
    throw HTTPError(BAD_REQUEST, 'user is not an owner of the channel');
  }

  // check whether uId is currently the only an owner of the channel
  if (channel.owners.length === 1 && channel.owners[0] === uId) {
    throw HTTPError(BAD_REQUEST, 'user is only owner left in channel');
  }

  channel.owners = channel.owners.filter(id => id !== uId);

  setData(dataStore);
  return {};
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, channelLeaveV1, channelAddownerV1, channelRemoveownerV1 };
