import HTTPError from 'http-errors';

import {
  getData, setData,
  dataTYPE, channelTYPE,
} from './dataStore';

import { validateToken } from './tokens';

import { updateUserlog, updateServerlog } from './log';

interface channelId { channelId: number }
interface channelItem {
  channelId: number,
  name: string
}

const BAD_REQUEST = 400;

/**
 * returns a list of the channels that a user is a part of, given their Id
 *
 * ARGUMENTS:
 * @param {string} token of the authorised user
 *
 * RETURN VALUES:
 * @returns { {channels: {channelId: number, name: string}[] } } array of objects describing each channel, with channelId and name, if successful
 *
 * ERRORS:
 * @throws {403} if invalid token
 */
function channelsListV1(token: string): {channels: channelItem[]} {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // loop through and add channels to usersChannels
  const usersChannels: channelItem[] = [];

  for (const channel of dataStore.channels) {
    if (channel.members.includes(authUserId)) {
      usersChannels.push({
        channelId: channel.channelId,
        name: channel.channelName,
      });
    }
  }

  return {
    channels: usersChannels
  };
}

/**
 * given the name, the authorised user and the public status,
 * lets user create a new channel and automatically adds user to the channel
 * as an owner and member
 *
 * ARGUMENTS:
 * @param {string} token of the authorised user creating the channel
 * @param {string} name of the channel
 * @param {boolean} isPublic status of the channel
 *
 * RETURN VALUES:
 * @returns { {channelId: number} } object with the channelId of the created channel, if channel successfully created
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} channel name wrong length
 */
function channelsCreateV1(token: string, name: string, isPublic: boolean): channelId {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // check if channel name is good length (0 < length <= 20)
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(BAD_REQUEST, 'invalid channel name length');
  }

  // generate unique channelId
  const newId = generateChannelID();

  const newChannel: channelTYPE = {
    channelId: newId,
    channelName: name,
    publicStatus: isPublic,
    members: [authUserId],
    owners: [authUserId],
    messages: [],
  };

  dataStore.standup.push({
    channelId: newId,
    isActive: false,
    creator: null,
    message: [],
    timeFinish: null
  });

  dataStore.channels.push(newChannel);

  setData(dataStore);

  updateServerlog('c');
  updateUserlog('c', token);

  return {
    channelId: newId,
  };
}

/**
 * given a valid user id, returns a list of all channels in dataStore (including private channels)
 *
 * ARGUMENTS:
 * @param {string} token of user requesting list of all channels
 *
 * RETURN VALUES:
 * @returns { {channels: {
 *  channelId: number,
 *  name: string
 * }[] } } array of channelId + name objects, giving information about all channels
 *
 * ERRORS:
 * @throws {403} if invalid token
 */
function channelsListallV1(token: string): {channels: channelItem[]} {
  validateToken(token);

  const dataStore: dataTYPE = getData();

  // accessing the dataStore and pushing non-sensitive information into a new array
  const allChannels: channelItem[] = dataStore.channels.map((channel) => { return { channelId: channel.channelId, name: channel.channelName }; });

  // returning an array of all channels
  return {
    channels: allChannels
  };
}

/**
 * generates a unique, unused channel id for a new channel
 *
 * ARGUMENTS:
 * no parameters
 *
 * RETURN VALUES:
 * @returns {number} new unique channel Id for new channel
 */
function generateChannelID(): number {
  const dataStore = getData();

  // get array of all channels ids
  const channelIds: number[] = dataStore.channels.map((channel) => channel.channelId);

  if (channelIds.length === 0) {
    // if no channels exist, return 1 (which is a new id)
    return 1;
  }

  // if other channels exist, return the highest Id so far plus one
  return Math.max(...channelIds) + 1;
}

/**
 * checks if a channel with the given channelId exists
 *
 * ARGUMENTS:
 * @param {number} channelId the channelId to check validity of
 *
 * RETURN VALUES:
 * @returns {channelTYPE} returns channel information from dataStore if channel exists
 *
 * ERRORS:
 * @throws {400} if channel does not exist
 */
function validateChannel(channelId: number): channelTYPE {
  const dataStore: dataTYPE = getData();

  const matchingChannels = dataStore.channels.filter((channel) => channel.channelId === channelId);
  if (matchingChannels.length === 0) {
    throw HTTPError(BAD_REQUEST, 'invalid channel id');
  }

  return matchingChannels[0];
}
export { channelsCreateV1, channelsListV1, channelsListallV1, validateChannel };
