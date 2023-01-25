import HTTPError from 'http-errors';

import {
  getData, setData
} from './dataStore';
import { userProfileV2 } from './users';
import { validateToken } from './tokens';
import { validateChannel } from './channels';
import { createMessageId } from './message';
import { updateServerlog, updateUserlog } from './log';

const FORBIDDEN = 403;
const BAD_REQUEST = 400;

/**
 * deletes all timeouts created by standup start
 *
 * ARGUMENTS:
 * none
 *
 * RETURN VALUES:
 * none
 */
const standupTimeouts: ReturnType<typeof setTimeout>[] = [];
function clearStandupTimeout() {
  for (const standupTimeout of standupTimeouts) {
    clearTimeout(standupTimeout);
  }
}

/**
 * allows the members of a channel to start a standup
 *
 * ARGUMENTS:
 * @param {string} token of user trying to start a standup
 * @param {number} channelId of channel for standup to be active in
 * @param {number} length of time in seconds for standup to run
 *
 * RETURNS:
 * @returns {timeFinish} returns the time at which the standup finishes
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {403} if auth user is not in the channel
 * @throws {400} if channelId is invalid
 * @throws {400} if the length is less than zero
 * @throws {400} if a standup in the channel is already active
 *
 */

function standupStartV1(token: string, channelId: number, length: number) {
  const authUserId = validateToken(token);
  const channel = validateChannel(channelId);

  const dataStore = getData();

  const standupChannel = dataStore.standup.filter(x => x.channelId === channelId)[0];

  if (length < 0) {
    throw HTTPError(BAD_REQUEST, "Time isn't valid!");
  }
  if (standupChannel.isActive === true) {
    throw HTTPError(BAD_REQUEST, 'Standup is already active!');
  }
  if (!(channel.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'You are not a member of this channel!');
  }

  standupChannel.isActive = true;
  standupChannel.creator = authUserId;
  standupChannel.timeFinish = Date.parse(new Date().toISOString()) / 1000 + length;

  setData(dataStore);

  const standupTimeout = setTimeout(standupFinished, length * 1000, channelId, authUserId);
  standupTimeouts.push(standupTimeout);

  updateServerlog('m');

  return { timeFinish: standupChannel.timeFinish };
}

/**
 * called when standup in a channel is finished and updates dataStore with standup details
 *
 * ARGUMENTS:
 * @param {number} authUserId of user that started the standup
 * @param {number} channelId of channel for standup to be active in
 *
 * RETURNS:
 * none
 *
 * ERRORS:
 * none
 *
 */

export function standupFinished(channelId: number, authUserId: number) {
  validateChannel(channelId);
  console.log(`channelId: ${channelId}, authUserId: ${authUserId}`);
  const messageId = createMessageId();
  const dataStore = getData();
  const standupChannel = dataStore.standup.filter(x => x.channelId === channelId)[0];
  const wholeMessage = standupChannel.message.join('\n');

  dataStore.messages.push({
    messageId: messageId,
    message: wholeMessage,
    uId: authUserId,
    timeSent: standupChannel.timeFinish, // UNIX time format
    isPinned: false,
    reacts: []
  });
  const channel = dataStore.channels.filter(x => x.channelId === channelId)[0];
  channel.messages.push(messageId);

  standupChannel.isActive = false;
  standupChannel.creator = null;
  standupChannel.message = [];

  setData(dataStore);
}

/**
 * allows the members of a channel to get standup details
 *
 * ARGUMENTS:
 * @param {string} token of user trying to get current standup details
 * @param {number} channelId of channel for standup details
 *
 * RETURNS:
 * @returns { isActive } returns whether a standup is active within the channel
 * @returns { timeFinish } returns the time at which the standup finishes
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {403} if auth user is not in the channel
 * @throws {400} if channelId is invalid
 *
 */

function standupActiveV1(token: string, channelId: number) {
  const authUserId = validateToken(token);
  const channel = validateChannel(channelId);
  const dataStore = getData();

  if (!(channel.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'You are not a member of this channel!');
  }

  const standup = dataStore.standup.filter(x => x.channelId === channelId)[0];

  return { isActive: standup.isActive, timeFinish: standup.timeFinish };
}

/**
 * allows the members of a channel to send messages during a standup
 *
 * ARGUMENTS:
 * @param {string} token of user trying to unpin message
 * @param {number} channelId of channel for the message to be sent
 * @param {string} message of the user to be sent to the channel
 * RETURNS:
 * @returns { {} } empty object upon success
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {403} if auth user is not in the channel with the message
 * @throws {400} if channelId is invalid
 * @throws {400} if the message is longer than 1000 characters
 * @throws {400} if a standup in the channel is already active
 *
 */

function standupSendV1(token: string, channelId: number, message: string) {
  const authUserId = validateToken(token);
  const channel = validateChannel(channelId);

  const dataStore = getData();

  const standup = dataStore.standup.filter(x => x.channelId === channelId)[0];

  if (message.length > 1000) {
    throw HTTPError(BAD_REQUEST, 'Message is too long!');
  }
  if (standup.isActive === false) {
    throw HTTPError(BAD_REQUEST, 'No Standup is currently running!');
  }
  if (!(channel.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'You are not a member of this channel!');
  }

  const profile = userProfileV2(token, authUserId);
  standup.message.push(`${profile.user.handleStr}: ${message}`);

  setData(dataStore);

  updateUserlog('m', token);

  return {};
}

export { standupStartV1, standupActiveV1, standupSendV1, clearStandupTimeout };
