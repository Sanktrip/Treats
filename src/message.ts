import HTTPError from 'http-errors';

import {
  dmTYPE, dataTYPE, messageTYPE, channelTYPE,
  getData, setData, GLOBAL_OWNER
} from './dataStore';
import { validateChannel } from './channels';
import { validateDm } from './dm';
import { validateToken } from './tokens';
import { userProfileV2 } from './users';
import { notifyMessageReact } from './notifications';
import { updateServerlog, updateUserlog } from './log';

const BAD_REQUEST = 400;
const FORBIDDEN = 403;

const MESSAGE_MAX_LENGTH = 1000;
const IGNORE = -1;
const VALID_REACTS: number[] = [1]; // array of valid react ids

/**
 * allows the owner of a channel/dm to unpin a message in the channel/dm
 *
 * ARGUMENTS:
 * @param {string} token of user trying to unpin message
 * @param {number} messageId of message to be unpinned
 *
 * RETURNS:
 * @returns { {} } empty object upon success
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if auth user is not in the channel/dm with the message
 * @throws {403} if auth user does not have owner permissions in the channel/dm
 * @throws {400} if the message is not pinned
 */
function messageUnpinV1(token: string, messageId: number): Record<string, never> {
  const authUserId = validateToken(token);
  const dataStore = getData();

  messageWithinUserChannelDm(authUserId, messageId);

  // check owner permissions requirement
  const channels = dataStore.channels.filter(channel => channel.messages.includes(messageId));
  if (channels.length === 1) {
    const channel = channels[0];
    // check whether authUserId has owner permissions
    const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
    if ((!(channel.owners.includes(authUserId))) && authUserGlobalPermissions !== GLOBAL_OWNER) {
      throw HTTPError(FORBIDDEN, 'user does not have permission to pin message');
    }
  }
  const dms = dataStore.dms.filter(dm => dm.messages.includes(messageId));
  if (dms.length === 1) {
    const dm = dms[0];
    if (dm.owner !== authUserId) {
      throw HTTPError(FORBIDDEN, 'only dm creator can pin dm messages');
    }
  }

  // check if message is pinned
  const message = dataStore.messages.filter(message => message.messageId === messageId)[0];
  if (message.isPinned === false) {
    throw HTTPError(BAD_REQUEST, 'cannot unpin if message not pinned');
  }

  message.isPinned = false;

  setData(dataStore);

  return {};
}

/**
 * allows the owner of a channel/dm to pin a message in the channel/dm
 *
 * ARGUMENTS:
 * @param {string} token of user trying to pin message
 * @param {number} messageId of message to be pinned
 *
 * RETURNS:
 * @returns { {} } empty object upon success
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if auth user is not in the channel/dm with the message
 * @throws {403} if auth user does not have owner permissions in the channel/dm
 * @throws {400} if the message is already pinned
 */
function messagePinV1(token: string, messageId: number): Record<string, never> {
  const authUserId = validateToken(token);
  const dataStore = getData();

  messageWithinUserChannelDm(authUserId, messageId);

  // check owner permissions requirement
  const channels = dataStore.channels.filter(channel => channel.messages.includes(messageId));
  if (channels.length === 1) {
    const channel = channels[0];
    // check whether authUserId has owner permissions
    const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
    if ((!(channel.owners.includes(authUserId))) && authUserGlobalPermissions !== GLOBAL_OWNER) {
      throw HTTPError(FORBIDDEN, 'user does not have permission to pin message');
    }
  }
  const dms = dataStore.dms.filter(dm => dm.messages.includes(messageId));
  if (dms.length === 1) {
    const dm = dms[0];
    if (dm.owner !== authUserId) {
      throw HTTPError(FORBIDDEN, 'only dm creator can pin dm messages');
    }
  }

  // check if message already pinned
  const message = dataStore.messages.filter(message => message.messageId === messageId)[0];
  if (message.isPinned === true) {
    throw HTTPError(BAD_REQUEST, 'message already pinned');
  }

  message.isPinned = true;

  setData(dataStore);

  return {};
}

/**
 * takes the dataStore and authUserId and returns dataStore but with all the isThisUserReacted values correctly updated
 *
 * ARGUMENTS:
 * @param {dataTYPE} dataStore
 * @param {number} authUserId
 *
 * RETURN VALUES:
 * @returns {dataTYPE} updated dataStore
 */
function updateDataIsUserReacted(dataStore: dataTYPE, authUserId: number): dataTYPE {
  for (const message of dataStore.messages) {
    for (const react of message.reacts) {
      if (react.uIds.includes(authUserId)) {
        react.isThisUserReacted = true;
      } else {
        react.isThisUserReacted = false;
      }
    }
  }

  return dataStore;
}

/**
 * allows a user to unreact to a message
 *
 * ARGUMENTS:
 * @param {string} token of user unreacting
 * @param {number} messageId of message that user wants to unreact to
 * @param {number} reactId id of react that usre wants to remove
 *
 * RETURN VALUES:
 * @returns { {} } empty object upon success
 *
 * ERRORS:
 * @throws {403} if invalid token given
 * @throws {400} if invalid react id given
 * @throws {400} if user is not in same channel/dm as message
 * @throws {400} if no react to remove
 */
function messageUnreactV1(token: string, messageId: number, reactId: number): Record<string, never> {
  // validate token
  const authUserId = validateToken(token);

  // invalid reactId
  if (!(VALID_REACTS.includes(reactId))) {
    throw HTTPError(BAD_REQUEST, 'invalid react id');
  }

  // check if user is in same channel/dm as message => 400 if error
  messageWithinUserChannelDm(authUserId, messageId);

  // check if user has reacted yet
  const dataStore = getData();

  const message = dataStore.messages.filter(message => message.messageId === messageId)[0];

  const reacts = message.reacts.filter(react => react.reactId === reactId);

  if (reacts.length === 0 || (reacts.length === 1 && !(reacts[0].uIds.includes(authUserId)))) {
    throw HTTPError(BAD_REQUEST, 'user has not reacted to this message');
  }

  // if message does not have react yet
  reacts[0].uIds = reacts[0].uIds.filter(uId => uId !== authUserId);
  if (reacts[0].uIds.length === 0) {
    message.reacts = message.reacts.filter(react => react.reactId !== reactId);
  }

  setData(dataStore);

  return {};
}

/**
 * allows a user to react to a message
 *
 * ARGUMENTS:
 * @param {string} token of user reacting
 * @param {number} messageId of message user is reacting to
 * @param {number} reactId of react type
 *
 * RETURN VALUES:
 * @returns { {} } empty object upon success
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if invalid react id
 * @throws {400} if invalid message id
 * @throws {400} if user is not in same channel/dm as message
 * @throws {400} if user has already reacted in the exact same way to the exact same message before
 */
function messageReactV1(token: string, messageId: number, reactId: number): Record<string, never> {
  // validate token
  const authUserId = validateToken(token);

  // invalid reactId
  if (!(VALID_REACTS.includes(reactId))) {
    throw HTTPError(BAD_REQUEST, 'invalid react id');
  }

  // check if user is in same channel/dm as message => 400 if error
  messageWithinUserChannelDm(authUserId, messageId);

  // check if user has already reacted
  const dataStore = getData();
  const message = dataStore.messages.filter(message => message.messageId === messageId)[0];
  const reacts = message.reacts.filter(react => react.reactId === reactId);
  if (reacts.length === 1 && reacts[0].uIds.includes(authUserId)) {
    throw HTTPError(BAD_REQUEST, 'user has already reacted to this message with the same react');
  }

  // if message does not have react yet
  if (reacts.length === 0) {
    message.reacts.push({
      reactId: reactId,
      uIds: [authUserId],
      isThisUserReacted: true,
    });
  } else {
    reacts[0].uIds.push(authUserId);
    reacts[0].isThisUserReacted = true;
  }

  setData(dataStore);

  notifyMessageReact(token, messageId);

  return {};
}

/**
 * allows a user to share a message to a different channel or dm
 *
 * ARGUMENTS:
 * @param {string} token of user wanting to share the message
 * @param {number} ogMessageId message id of message that user wants to share
 * @param {string} message additional message that user may want to add
 * @param {number} channelId id of channel that user wants to share message to; -1 if they want to send to dm instead
 * @param {number} dmId id of dm that user wants to share message to; -1 if they want to send to channel instead
 *
 * RETURN VALUES:
 * @returns { {sharedMessageId: number} } id of new message created by share
 *
 * ERRORS:
 * changed the format to below, seems a little cleaner and organises what
 * causes which error
 * @throws {400} if: - neither channelId nor dmId is -1
 *                   - channelId or dmId is invalid
 *                   - user is not in same channel/dm as ogMessageId or ogMessageId invalid
 *                   - additional message length > 1000
 * @throws {403} if: - user is not in same channel/dm as the valid channelId/dmId
 *                   - invalid token
 */
function messageShareV1(token: string, ogMessageId: number, channelId: number, dmId: number, message?: string) {
  // validate token
  const authUserId: number = validateToken(token);
  const dataStore = getData();

  // handle if no additional message is given
  if (typeof message === 'undefined') {
    message = '';
  }

  // if neither channelId nor dmId are -1
  if (channelId !== IGNORE && dmId !== IGNORE) {
    throw HTTPError(BAD_REQUEST, 'neither channelId nor dmId are -1');
  }

  let members: number[];
  let relevantId: number = IGNORE;

  let shareToChannel = true; // true = auth user shares to a channel, false = auth user shares to dm

  // if channelId and dmId are invalid throw ERROR else set relevantId to that
  if (channelId !== IGNORE) {
    members = validateChannel(channelId).members;
    relevantId = channelId;
  } else {
    members = validateDm(dmId).members;
    relevantId = dmId;
    shareToChannel = false;
  }

  // if auth user is not in channel/dm
  if (!(members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'auth user is not in channel/dm that they are trying to share message to');
  }

  // if additional message too long
  if (message.length > MESSAGE_MAX_LENGTH) {
    throw HTTPError(BAD_REQUEST, 'message > 1000 characters');
  }

  // check if user is in same channel/dm as ogMessageId
  messageWithinUserChannelDm(authUserId, ogMessageId);

  // get old message + add combined message to messages array
  const oldMessage = dataStore.messages.filter(message => message.messageId === ogMessageId)[0].message;
  const sharedMessage = `shared: ${oldMessage}; new: ${message}`;

  // add the message to the dataStore
  const messageId: number = createMessageId();
  dataStore.messages.push({
    messageId: messageId,
    message: sharedMessage,
    uId: authUserId,
    timeSent: getTimestamp(),
    isPinned: false,
    reacts: []
  });

  // add message to channel/dm
  if (shareToChannel === true) {
    for (const channel of dataStore.channels) {
      if (channel.channelId === relevantId) {
        channel.messages.push(messageId);
        const profile = userProfileV2(token, authUserId);
        const tags = messageContainsTag(sharedMessage);
        const subMessage = sharedMessage.substring(0, 20);
        for (const uId of tags) {
          dataStore.notifications[uId].unshift({
            channelId: channel.channelId,
            dmId: -1,
            notificationMessage: `${profile.user.handleStr} tagged you in ${channel.channelName}: ${subMessage}`
          });
        }
      }
    }
  } else {
    for (const dm of dataStore.dms) {
      if (dm.dmId === relevantId) {
        dm.messages.push(messageId);
        const profile = userProfileV2(token, authUserId);
        const tags = messageContainsTag(sharedMessage);
        const subMessage = sharedMessage.substring(0, 20);
        for (const uId of tags) {
          dataStore.notifications[uId].unshift({
            channelId: -1,
            dmId: dm.dmId,
            notificationMessage: `${profile.user.handleStr} tagged you in ${dm.name}: ${subMessage}`
          });
        }
      }
    }
  }

  setData(dataStore);

  return { sharedMessageId: messageId };
}

/**
 * edits a message to a new message, given that the user is allowed to do so
 *
 * ARGUMENTS:
 * @param {number} authUserId uId of user trying to edit message
 * @param {number} messageId message Id of message to be edited
 * @param {string} message new message contents
 *
 * RETURN VALUES:
 * @returns { {} } if successfully edited
 *
 * ERRORS:
 * @throws {400} if: - an invalid messageId is passed
 *                   - the message is longer than max length
 *                   - user not in channel/dm that message is in
 * @throws {403} if: - (in channel) user does not have global permissions AND user did not send message
 *                   - (in dm) user did not send message
 */
function messageEditV1(token: string, messageId: number, newMessage: string): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // if the message is a empty string, delete it
  if (newMessage === '') {
    return messageRemoveV1(token, messageId);
  }
  // if message Id does not exist, return ERROR
  if (validateMessage(messageId) === false) {
    throw HTTPError(BAD_REQUEST, 'invalid message id');
  }
  // if message too long, return error
  if (newMessage.length > MESSAGE_MAX_LENGTH) {
    throw HTTPError(BAD_REQUEST, 'message too long');
  }

  // if message exists, store message data
  const matchingMessage = dataStore.messages.filter(message => message.messageId === messageId)[0];

  // loop through channels
  const matchingChannels = dataStore.channels.filter(channel => channel.messages.includes(messageId));

  if (matchingChannels.length === 1) {
    const matchingChannel = matchingChannels[0];

    // authUser is not in the channel
    if (!(matchingChannel.members.includes(authUserId))) {
      throw HTTPError(BAD_REQUEST, 'auth user is not in channel that message is in');
    }

    // authUser does not have owner permissions in channel and did not send the message
    const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
    if ((!(matchingChannel.owners.includes(authUserId))) && authUserGlobalPermissions !== GLOBAL_OWNER && matchingMessage.uId !== authUserId) {
      throw HTTPError(FORBIDDEN, 'auth user does not have global permissions and did not send the message');
    }

    const message = dataStore.messages.filter(message => message.messageId === messageId)[0];
    const profile = userProfileV2(token, authUserId);
    const originalTags = messageContainsTag(message.message);
    const newTags = messageContainsTag(newMessage);
    const subMessage = newMessage.substring(0, 20);
    for (const uId of newTags) {
      if (!(originalTags.includes(uId))) {
        dataStore.notifications[uId].unshift({
          dmId: -1,
          channelId: matchingChannel.channelId,
          notificationMessage: `${profile.user.handleStr} tagged you in ${matchingChannel.channelName}: ${subMessage}`
        });
      }
    }
  }

  // loop through dms
  const matchingDms = dataStore.dms.filter(dm => dm.messages.includes(messageId));

  if (matchingDms.length === 1) {
    const matchingDm = matchingDms[0];

    // authUser is not in the dm
    if (!(matchingDm.members.includes(authUserId))) {
      throw HTTPError(BAD_REQUEST, 'auth user is not in dm that message is in');
    }

    // authUser did not send the message
    if (matchingDm.owner !== authUserId && matchingMessage.uId !== authUserId) {
      throw HTTPError(FORBIDDEN, 'auth user did not send the dm message');
    }
    const message = dataStore.messages.filter(message => message.messageId === messageId)[0];
    const profile = userProfileV2(token, authUserId);
    const originalTags = messageContainsTag(message.message);
    const newTags = messageContainsTag(newMessage);
    const subMessage = newMessage.substring(0, 20);
    for (const uId of newTags) {
      if (!(originalTags.includes(uId))) {
        dataStore.notifications[uId].unshift({
          dmId: matchingDm.dmId,
          channelId: -1,
          notificationMessage: `${profile.user.handleStr} tagged you in ${matchingDm.name}: ${subMessage}`
        });
      }
    }
  }

  // if no errors
  const message = dataStore.messages.filter(message => message.messageId === messageId)[0];
  message.message = newMessage;

  setData(dataStore);

  return {};
}

/**
 * removes a message from a dm or channel
 *
 * ARGUMENTS:
 * @param {number} authUserId uId of authorised user trying to remove message
 * @param {number} messageId messageId of message trying to be removed
 *
 * RETURN VALUES
 * @returns { {} } upon success
 *
 * ERRORS:
 * @throws {400} if: - an invalid messageId is passed
 *                   - user not in channel/dm that message is in
 * @throws {403} if: - (in channel) user does not have global permissions AND user did not send message
 *                   - (in dm) user did not send message
 */
function messageRemoveV1(token: string, messageId: number): Record<string, never> {
  const authUserId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // if message Id does not exist, return ERROR
  if (validateMessage(messageId) === false) {
    throw HTTPError(BAD_REQUEST, 'invalid message id');
  }
  // if message exists, store message data
  const matchingMessage = dataStore.messages.filter(message => message.messageId === messageId)[0];

  // case for removing from a channel
  const channels = dataStore.channels.filter(channel => channel.messages.includes(messageId));
  if (channels.length === 1) {
    const channel = channels[0];

    // authUser is not in the channel
    if (!(channel.members.includes(authUserId))) {
      throw HTTPError(BAD_REQUEST, 'auth user is not in channel that message is in');
    }

    // authUser does not have owner permissions in channel and did not send the message
    const authUserGlobalPermissions = Object.values(dataStore.users).filter(user => user.uId === authUserId)[0].globalPermission;
    if ((!(channel.owners.includes(authUserId))) && authUserGlobalPermissions !== GLOBAL_OWNER && matchingMessage.uId !== authUserId) {
      throw HTTPError(FORBIDDEN, 'auth user does not have global permissions and did not send the message');
    }

    // remove message from channel.messages array
    channel.messages = channel.messages.filter(mId => mId !== messageId);
  }

  // case for removing from a DM
  const dms = dataStore.dms.filter(dm => dm.messages.includes(messageId));
  if (dms.length === 1) {
    const dm = dms[0];

    // authUser is not in the channel
    if (!(dm.members.includes(authUserId))) {
      throw HTTPError(BAD_REQUEST, 'auth user is not in dm that message is in');
    }

    // authUser is not original creator of dm and did not send the message
    if (dm.owner !== authUserId && matchingMessage.uId !== authUserId) {
      throw HTTPError(FORBIDDEN, 'auth user did not send the dm message');
    }

    // remove message from channel.messages array
    dm.messages = dm.messages.filter(mId => mId !== messageId);
  }

  // remove any DMs flagged as unsent
  dataStore.messages = dataStore.messages.filter(message =>
    (message.isPinned !== true) &&
    (message.message !== 'UNSENT_DM_MESSAGE') &&
    (message.messageId !== messageId));

  setData(dataStore);

  updateServerlog('m');

  return {};
}

/**
 * checks if a message Id is valid
 *
 * ARGUMENTS:
 * @param {number} messageId message id of message
 *
 * RETURN VALUES:
 * @returns {boolean} true if message exists, false if duplicates or no messages exist
 */
function validateMessage(messageId: number): boolean {
  const dataStore: dataTYPE = getData();

  // if message Id does not exist, return false
  const matchingMessages = dataStore.messages.filter(message => message.messageId === messageId);

  if (matchingMessages.length < 1) {
    return false;
  }
  return true;
}

/**
 * Sends message in given channel by given user with timestamp
 * in Unix time format
 *
 * ARGUMENTS:
 * @param {number} userId of user sending message
 * @param {number} channelId of channel message is being sent to
 * @param {string} message that is being sent
 *
 * RETURN VALUES:
 * @returns { {messageId: number} } upon success
 *
 * ERRORS:
 * @throws {400} if: - an invalid channelId is passed
 *                   - the message is longer than max length and less than 1
 * @throws {403} if: - user is not in channel
 *
*/
function messageSendV1(token: string, channelId: number, message: string): {messageId: number} {
  const userId = validateToken(token);

  const dataStore: dataTYPE = getData();

  // check if channelId is valid
  const matchingChannel = validateChannel(channelId);

  // check if user is in channel
  if (!(matchingChannel.members.includes(userId))) {
    throw HTTPError(FORBIDDEN, 'auth user is not a channel member');
  }

  // check correct message length
  if ((message.length < 1) || (message.length > 1000)) {
    throw HTTPError(BAD_REQUEST, 'message invalid length');
  }

  // generate messageId
  const mId = createMessageId();

  // updates dataStore
  dataStore.messages.push({
    messageId: mId,
    message: message,
    uId: userId,
    timeSent: Math.floor(getTimestamp()), // unix time format
    isPinned: false,
    reacts: []
  });

  // post new data
  setData(dataStore);

  addMessageToChannel(token, userId, channelId, message, mId, matchingChannel);

  updateUserlog('m', token);
  updateServerlog('m');

  // returning messageId
  return { messageId: mId };
}

/**
 * Send a message from authorisedUser to the DM specified by dmId.
 *
 * ARGUMENTS:
 * @param {string} token of the user calling the function
 * @param {number} dmId of the dm that the user wants to post to
 * @param {string} message to be put in the DM
 *
 * RETURN VALUES:
 * @returns {{messageId: number}} messageID of the message
 *
 * ERRORS:
 * @throws {400} if: - an invalid dmId is passed
 *                   - the message is longer than max length and less than 1
 * @throws {403} if: - user is not in dm
 */
function sendDmV1(token: string, dmId: number, message: string): {messageId: number} {
  // check user is a member of the dm
  const authUserId = validateToken(token);
  // check dmId is valid
  dmIdValid(dmId);

  userMemberOfDm(dmId, authUserId);

  // check message length is between 1 and 1000 (inclusive)
  if ((message.length < 1) || (message.length > 1000)) {
    console.log('-------===========length10000');
    throw HTTPError(BAD_REQUEST, 'invalid message length');
  }

  // add the message to the dataStore
  const data: dataTYPE = getData();
  const messageId: number = createMessageId();
  data.messages.push({
    messageId: messageId,
    message: message,
    uId: authUserId,
    timeSent: getTimestamp(),
    isPinned: false,
    reacts: []
  });
  setData(data);

  // add the messageId to the DM's messages
  addDmMessage(token, authUserId, dmId, message, messageId);

  updateServerlog('m');
  updateUserlog('m', token);

  return { messageId: messageId };
}

/**
 * returns the messages in the dm
 *
 * ARGUMENTS:
 * @param {string} token of authUser trying to get dm messages
 * @param {number} dmId id of dm that user wants messages of
 * @param {number} start index of messages
 *
 * RETURN VALUES:
 * @returns { {messages: array, start: integer, end: integer} } object containing messages array
 *
 * ERRORS:
 * @throws {400} if: - an invalid dmId is passed
 *                   - start is greater than total messages in dm
 * @throws {403} if: - user is not part of dm
 */
function dmMessagesV1(token: string, dmId: number, start: number) {
  const uId = validateToken(token);

  // load the data and find the DM of concern,
  // error if given DM does not exist
  const data = updateDataIsUserReacted(getData(), uId);
  // console.log(data.messages[0].reacts);

  let targetDm = -1;
  for (const dm in data.dms) {
    if (data.dms[dm].dmId === dmId) {
      targetDm = parseInt(dm);
    }
  }
  // console.log(`targetDmIndex ${targetDm}`);
  if (targetDm === -1) {
    throw HTTPError(BAD_REQUEST, 'dm id does not exist');
  }

  // check the user is part of the DM
  userMemberOfDm(dmId, uId);

  // check the ammount of messages and error if less than start value
  const messageCount = data.dms[targetDm].messages.length;
  // console.log(data.dms[targetDm])
  // console.log(`message count: ${messageCount}`);
  if (messageCount < start) {
    throw HTTPError(BAD_REQUEST, 'start is greater than total number of messages');
  }

  // calculate end value to return (either start + 50)
  let end = -1;
  if (messageCount >= start + 50) end = start + 50;

  // go through the messages and push them to an array
  const messages: messageTYPE[] = [];
  let current = start;
  while ((current <= messageCount) && (current <= start + 50)) {
    // console.log(findMessageAtIndex(current, data.dms[targetDm].messages));
    messages.push(findMessageAtIndex(uId, current, data.dms[targetDm].messages));
    current += 1;
  }

  // return the messages array, and the start and end values
  return {
    messages: messages.filter(message => message != null),
    start: start,
    end: end
  };
}

/**
 * clears the time created by messageSendLater (called by clearV1())
 *
 * ARGUMENTS:
 * none
 *
 * RETURN VALUES:
 * none
 */
const messageSendLaterTimeouts: ReturnType<typeof setTimeout>[] = [];
function clearMessageSendLaterTimeout() {
  for (const timeout of messageSendLaterTimeouts) {
    clearTimeout(timeout);
  }
}

/**
 * sends a message after a specified time
 *
 * ARGUMENTS:
 * @param {number} token of authUser trying to get dm messages
 * @param {number} channelId to post message to
 * @param {string} message to post
 * @param {number} timeSent the time at which to post
 *
 * RETURN VALUES:
 * @returns {number} the messageId of the message to be sent
 * @returns {errorTYPE} when channelId not valid, length > 1000 or < 1, timeSent in the past
 */
function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  // check errors

  const userId = validateToken(token);
  // check if channelId is valid
  const matchingChannel = validateChannel(channelId);

  // check if user is in channel
  if (!(matchingChannel.members.includes(userId))) {
    throw HTTPError(FORBIDDEN, 'auth user is not a channel member');
  }

  // check correct message length
  if ((message.length < 1) || (message.length > 1000)) {
    throw HTTPError(BAD_REQUEST, 'message invalid length');
  }

  // check TimeSent is not in the past
  if (timeSent < getTimestamp()) {
    throw HTTPError(BAD_REQUEST, 'TimeSent is in the past');
  }

  // add message to the general messages array

  // generate messageId
  const mId = createMessageId();

  // updates dataStore
  const dataStore: dataTYPE = getData();
  dataStore.messages.push({
    messageId: mId,
    message: message,
    uId: userId,
    timeSent: timeSent, // unix time format
    isPinned: false,
    reacts: []
  });
  setData(dataStore);

  // when the time is right, add that message to the channel messages array

  const delayMiliseconds = (timeSent - getTimestamp()) * 1000;
  const messageSendLaterTimeout = setTimeout(() => {
    addMessageToChannel(token, userId, channelId, message, mId, matchingChannel);
  }, delayMiliseconds);
  messageSendLaterTimeouts.push(messageSendLaterTimeout);

  return { messageId: mId };
}

/**
 * sends a message after a specified time
 *
 * ARGUMENTS:
 * @param {number} token of authUser trying to get dm messages
 * @param {number} dmId to post message to
 * @param {string} message to post
 * @param {number} timeSent the time at which to post
 *
 * RETURN VALUES:
 * @returns {number} the messageId of the message to be sent
 * @returns {errorTYPE} when channelId not valid, length > 1000 or < 1, timeSent in the past
 */
function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  const userId = validateToken(token);
  // check if channelId is valid
  const matchingDm = validateDm(dmId);

  // check if user is in channel
  if (!(matchingDm.members.includes(userId))) {
    throw HTTPError(FORBIDDEN, 'auth user is not a member of DM');
  }

  // check correct message length
  if ((message.length < 1) || (message.length > 1000)) {
    throw HTTPError(BAD_REQUEST, 'message invalid length');
  }

  // check TimeSent is not in the past
  if (timeSent < getTimestamp()) {
    throw HTTPError(BAD_REQUEST, 'TimeSent is in the past');
  }

  // add message to the general messages array

  // generate messageId
  const mId = createMessageId();

  // updates dataStore
  // Message set to "UNSENT_DM_MESSAGE" to mark as an unsent message
  // Pinned also set to 'true' so a message with "UNSENT_DM_MESSAGE" entered normally doesn't break anything
  const dataStore: dataTYPE = getData();
  dataStore.messages.push({
    messageId: mId,
    message: 'UNSENT_DM_MESSAGE',
    uId: userId,
    timeSent: timeSent, // unix time format
    isPinned: true,
    reacts: []
  });
  setData(dataStore);

  // when the time is right, add that message to the channel messages array

  const delayMiliseconds = (timeSent - getTimestamp()) * 1000;
  const messageSendLaterTimeout = setTimeout(() => {
    const dataStore: dataTYPE = getData();
    // change the flags for an unsent message back to their right value
    for (const currentMessage of dataStore.messages) {
      if (currentMessage.messageId === mId) {
        currentMessage.message = message;
        currentMessage.isPinned = false;
        setData(dataStore);
        addDmMessage(token, userId, dmId, message, mId);
      }
    }
  }, delayMiliseconds);
  messageSendLaterTimeouts.push(messageSendLaterTimeout);

  return { messageId: mId };
}

/**
 * finds all messages in channels and dms that user is in and returns the messages that contain a matcht to the query str
 *
 * ARGUMENTS:
 * @param {string} token of user searching
 * @param {string} queryStr string that user is searching
 *
 * RETURN VALUES:
 * @returns { messages: messageTYPE[] } an array of matching messages
 *
 * ERRORS:
 * @throws {403} if invalid token
 * @throws {400} if queryStr not 1-1000 characters long
 */
function searchV1(token: string, queryStr: string) {
  const authUserId = validateToken(token);
  const dataStore = getData();

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(BAD_REQUEST, 'Query string length invalid');
  }
  const channels = dataStore.channels.filter(x => x.members.includes(authUserId));
  const channelMessages = channels.map(x => x.messages);

  const dms = dataStore.dms.filter(x => x.members.includes(authUserId));
  const dmMessages = dms.map(x => x.messages);

  const allMessageIdsArr = dmMessages.concat(channelMessages);
  const allMessageIds = [].concat([], ...allMessageIdsArr);

  const allMessages = dataStore.messages.filter(x => allMessageIds.includes(x.messageId));

  // the .toLowerCase() makes the search case-insensitive
  queryStr = queryStr.toLowerCase();

  const regex = new RegExp(`${queryStr}`);

  const relevantMessagesObj = allMessages.filter(x => regex.test(x.message.toLowerCase()));

  return { messages: relevantMessagesObj };
}

/** *********************** helper functions ********************************/

/**
 * takes an index and an array of messages,
 * and returns the messsage of the given index, orded by timestamp
 *
 * ARGUMENTS:
 * @param {number} authUserId the uId of user making this request
 * @param {number} index the index of the target message
 * @param {message[]} messageArray the array of messages through which to search
 *
 * RETURN VALUES:
 * @returns {number} the message at the given index, sorted by timestamp
 */
function findMessageAtIndex(authUserId: number, index: number, messageArray: number[]): messageTYPE {
  // console.log(`running findMessageAtIndex with values of ${index} \n ${messageArray}`);
  const data = updateDataIsUserReacted(getData(), authUserId);
  const constructedMessageArray = data.messages.filter((message) => messageArray.includes(message.messageId));
  const timestampArray = constructedMessageArray.map((message) => message.timeSent);
  timestampArray.sort((a, b) => b - a); // a sorted array of all timestamps
  // console.log(`messageArray: ${messageArray} \nconstructedArray: ${constructedMessageArray} \ntimestamp array: ${timestampArray} `);
  // return the timestamp at at the given index
  return constructedMessageArray.filter((message) => message.timeSent === timestampArray[index])[0];
}

/**
 * takes in a dmId and returns true if it exists, false otherwise
 *
 * ARGUMENTS:
 * @param {number} dmId to search for
 *
 * RETURN VALUES
 * @returns {boolean} true if dmId exists
 *
 * ERRORS:
 * @throws {400} if: - an invalid dmId is passed
 */
function dmIdValid(dmId: number): boolean {
  const data = getData();

  const dmIds: number[] = data.dms.map((dm) => dm.dmId);
  if (!(dmIds.includes(dmId))) {
    throw HTTPError(BAD_REQUEST, 'invalid dm id');
  }

  return true;
}

/**
 * takes in a dmId and returns true if it exists, false otherwise
 *
 * ARGUMENTS:
 * @param {number} dmId to search for
 * @param {number} authUserId check if this uId is part of dm
 *
 * RETURN VALUES
 * no return value
 *
 * ERRORS:
 * @throws {403} if: - user is not part of dm
 */
function userMemberOfDm(dmId: number, authUserId: number) {
  const data = getData();

  // find the dm to search
  let targetDm: dmTYPE;
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      targetDm = dm;
    }
  }

  // check if the user is part of the dm
  if (!(targetDm.members.includes(authUserId))) {
    throw HTTPError(FORBIDDEN, 'user is not a dm member');
  }
}

/**
 *
 * Creates a unique message ID
 *
 * ARGUMENTS:
 *  none
 *
 * RETURN VALUES
 * @returns {number} a unique message ID
 */
function createMessageId(): number {
  const data = getData();

  // get array of all messageIds
  const messageIds: number[] = data.messages.map((message) => message.messageId);

  // if no messages exist, return 1
  if (messageIds.length === 0) {
    return 1;
  }

  // otherwise return the highest + 1
  return Math.max(...messageIds) + 1;
}

// returns current unix time
function getTimestamp(): number {
  return Date.parse(new Date().toISOString()) / 1000;
}

/**
 * checks if a user is in the same dm or channel as the message
 *
 * ARGUMENTS:
 * @param {number} authUserId of user we want to check
 * @param {number} messageId of the message we want to check
 *
 * RETURNS:
 *  none
 *
 * THROWS:
 * @throws {400} if messageId invalid
 * @throws {400} if message is in dm but user is not in the dm
 * @throws {400} if message is in channel but user is not in channel
 */
function messageWithinUserChannelDm(authUserId: number, messageId: number) {
  const dataStore = getData();

  // check if user is in same channel/dm as ogMessageId
  const channelsWithMessage = dataStore.channels.filter(channel => channel.messages.includes(messageId));
  const dmsWithMessage = dataStore.dms.filter(dm => dm.messages.includes(messageId));
  if (channelsWithMessage.length < 1 && dmsWithMessage.length < 1) {
    throw HTTPError(BAD_REQUEST, 'no channels or dms have messageId');
  }
  if (channelsWithMessage.length === 1 && !(channelsWithMessage[0].members.includes(authUserId))) {
    throw HTTPError(BAD_REQUEST, 'auth user is not in same channel as ogMessageId');
  }
  if (dmsWithMessage.length === 1 && !(dmsWithMessage[0].members.includes(authUserId))) {
    throw HTTPError(BAD_REQUEST, 'auth user is not in the same dm as ogMessageId');
  }
}

/**
 * finds all tags in a message and returns array of uIds of users who are tagged
 *
 * ARGUMENTS:
 * @param {string} message that we wanna find tags in
 *
 * ERROR VALUES:
 * @returns {number[]} array of uIds of users who are tagged in the message
 */
function messageContainsTag(message: string): number[] {
  const dataStore: dataTYPE = getData();
  const regex = /@\w*/g;
  const tagged = message.matchAll(regex);
  const tags = [];
  const user = Object.values(dataStore.users);
  for (const handles of tagged) {
    const handle = user.find(x => '@' + x.handleStr === handles[0]);
    if (handle !== undefined) {
      tags.push(handle.uId);
    }
  }
  const validTags = [...new Set(tags)];
  return validTags;
}

/**
 * a function that all the data about a channel message and adds it to the Dm
 *
 * ARGUMENTS:
 * @param {string} token any valid token - used to get profile info
 * @param {number} userId of the user posting the message
 * @param {number} channelId for the dm to be added into
 * @param {string} message the content of the message
 * @param {number} mId of the message to be added
 *
 * RETURNS:
 * none
 */
function addMessageToChannel(token: string, userId: number, channelId: number, message: string, mId: number, matchingChannel: channelTYPE) {
  const dataStore: dataTYPE = getData();

  // adds messageId to channel
  for (const channel of dataStore.channels) {
    if (channel.channelId === channelId) {
      channel.messages.unshift(mId);
    }
  }

  const profile = userProfileV2(token, userId);
  const tags = messageContainsTag(message);
  const subMessage = message.substring(0, 20);
  for (const uId of tags) {
    dataStore.notifications[uId].unshift({
      channelId: matchingChannel.channelId,
      dmId: -1,
      notificationMessage: `${profile.user.handleStr} tagged you in ${matchingChannel.channelName}: ${subMessage}`
    });
  }

  // post new data
  setData(dataStore);

  // updateServerlog('m');
  // updateUserlog('m', token);
}

/**
 * a function that takes in all the data about a DM message and adds it to the Dm
 *
 * ARGUMENTS:
 * @param {string} token any valid token - used to get profile info
 * @param {number} authUserId of the user posting the message
 * @param {number} dmId for the dm to be added to
 * @param {string} message the content of the message
 * @param {number} messageId of the dm to be added
 *
 * RETURNS:
 * none
 */
function addDmMessage(token: string, authUserId: number, dmId: number, message: string, messageId: number) {
  const data: dataTYPE = getData();
  // add the messageId to the DM's messages
  for (const i in data.dms) {
    if (data.dms[i].dmId === dmId) data.dms[i].messages.push(messageId);
  }

  const profile = userProfileV2(token, authUserId);
  const tags = messageContainsTag(message);
  const subMessage = message.substring(0, 20);
  const dm = data.dms.find(x => x.dmId === dmId);
  for (const uId of tags) {
    data.notifications[uId].unshift({
      channelId: -1,
      dmId: dm.dmId,
      notificationMessage: `${profile.user.handleStr} tagged you in ${dm.name}: ${subMessage}`
    });
  }

  setData(data);
}

export { sendDmV1, dmMessagesV1, messageRemoveV1, messageEditV1, messageSendV1, messageShareV1, messageReactV1, messageUnreactV1, updateDataIsUserReacted, messagePinV1, messageUnpinV1, createMessageId, messageSendLaterV1, searchV1, getTimestamp, clearMessageSendLaterTimeout, messageSendLaterDmV1 };
