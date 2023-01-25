import {
  notificationTYPE,
  getData,
  setData
} from './dataStore';

import { validateToken } from './tokens';

import { userProfileV2 } from './users';

interface notificationsGet {
  notifications: notificationTYPE[]
}

/**
 * returns a user's 20 most recent notifications
 *
 * ARGUMENTS:
 * @param {string} token of user whose notifications we want
 *
 * RETURN VALUES:
 * @returns {notificationTYPE[]} an array of the user's notifications
 *
 * ERRORS:
 * @throws {403} if invalid token
 */
function notificationsGetV1(token: string): notificationsGet {
  const authUserId = validateToken(token);
  const dataStore = getData();
  const notifications = dataStore.notifications[authUserId];
  while (notifications.length > 20) {
    notifications.pop();
  }
  return { notifications: notifications };
}

/**
 * notifies an invitee that they have been invited to a channel
 *
 * ARGUMENTS:
 * @param {string} token of inviter
 * @param {number} inviteeUserId uId of invitee
 * @param {number} channelId of channel to which they have been invited
 *
 * RETURN VALUES:
 * none
 *
 * ERRORS:
 * @throws {403} if token is invalid
 */
function notifyChannelInvited(token: string, inviteeUserId: number, channelId: number) {
  const authUserId = validateToken(token);

  const dataStore = getData();

  const channel = dataStore.channels.filter(channel => channel.channelId === channelId)[0];

  const profile = userProfileV2(token, authUserId);

  dataStore.notifications[inviteeUserId].unshift({
    dmId: -1,
    channelId: channelId,
    notificationMessage: `${profile.user.handleStr} added you to ${channel.channelName}`
  });

  setData(dataStore);
}

/**
 * notifies people a dm a sent to that theyve been added to the dm
 *
 * @param {string} token of dm creator
 * @param {number[]} uIds of all users in dm
 * @param {number} dmId of dm created
 * @param {string} dmName of dm invited to
 *
 * RETURN VALUES:
 * none
 *
 * ERRORS:
 * @throws {403} if token is invalid
 */
function notifyDmInvited(token: string, uIds: number[], dmId: number, dmName: string) {
  const authUserId = validateToken(token);

  const dataStore = getData();

  const profile = userProfileV2(token, authUserId);

  for (const uId of uIds.filter(uId => uId !== authUserId)) {
    dataStore.notifications[uId].unshift({
      dmId: dmId,
      channelId: -1,
      notificationMessage: `${profile.user.handleStr} added you to ${dmName}`
    });
  }

  setData(dataStore);
}

/**
 * notifies the sender of a message that someone has reacted to their message
 *
 * ARGUMENTS:
 * @param {string} token of reacter
 * @param {number} messageId of message reacted
 *
 * RETURN VALUES:
 * none
 *
 * ERRORS:
 * @throws {403} if invalid token
 */
function notifyMessageReact(token: string, messageId: number) {
  const authUserId = validateToken(token);

  const dataStore = getData();

  const message = dataStore.messages.filter(message => message.messageId === messageId)[0];

  const dm = dataStore.dms.find(x => x.messages.includes(messageId));

  const profile = userProfileV2(token, authUserId);

  if (dm === undefined) {
    const channel = dataStore.channels.find(x => x.messages.includes(messageId));
    dataStore.notifications[message.uId].unshift({
      dmId: -1,
      channelId: channel.channelId,
      notificationMessage: `${profile.user.handleStr} reacted to your message in ${channel.channelName}`
    });
  } else {
    dataStore.notifications[message.uId].unshift({
      dmId: dm.dmId,
      channelId: -1,
      notificationMessage: `${profile.user.handleStr} reacted to your message in ${dm.name}`
    });
  }

  setData(dataStore);
}

export { notificationsGetV1, notifyChannelInvited, notifyDmInvited, notifyMessageReact };
