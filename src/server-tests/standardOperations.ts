/* contains common functions used to set-up tests */

import { Response } from 'sync-request';

import {
  POST, GET, DELETE, BODY, PUT,
  authRegisterPATH,
  channelsCreatePATH,
  dmCreatePATH,
  channelJoinPATH,
  channelMessagesPATH,
  dmMessagesPATH,
  messageSendPATH,
  messageSendDmPATH,
  messageReactPATH,
  channelLeavePATH,
  dmLeavePATH,
  messagePinPATH,
  messageSendLaterPATH,
  channelInvitePATH,
  messageEditPATH,
  messageSharePATH,
  messageRemovePATH,
  channelDetailsPATH,
  dmDetailsPATH,
  userProfilePATH,
  userStatsPATH,
  usersStatsPATH
} from './httpRequestsV1';

// ===== STANDARD OUTPUTS ===== //
const OK = 200;

// ===== STANDARD INPUTS ===== //
export const EMAIL_VALID = 'hayden.smith@unsw.edu.au';

export const PASSWORD_VALID = 'password';

export const FIRSTNAME_VALID = 'Hayden';
export const LASTNAME_VALID = 'Smith';

export const CHANNEL_NAME_VALID = 'Imagine Dragons';
export const ISPUBLIC_VALID = true;

// ===== STANDARD OPERATIONS ===== //

/* register a new user and return their hashed token + uId */
export function registerUser(max: number) {
  let email = max + EMAIL_VALID;

  const user = POST(authRegisterPATH, {
    email: email,
    password: PASSWORD_VALID,
    nameFirst: FIRSTNAME_VALID,
    nameLast: LASTNAME_VALID
  });

  expect(user.statusCode).toBe(OK);
  return BODY(user);
}

/* gets a user's profile */
export function getProfile(token: string, uId: number) {
  const profile = GET(userProfilePATH, {
    token: token,
    uId: uId
  });

  expect(profile.statusCode).toBe(OK);
  return BODY(profile).user;
}

/* create a new channel with user */
export function createChannel(token: string): number {
  const channel = POST(channelsCreatePATH, {
    token: token,
    name: CHANNEL_NAME_VALID,
    isPublic: ISPUBLIC_VALID
  });

  expect(channel.statusCode).toBe(OK);
  return BODY(channel).channelId;
}

/* create a new dm to users */
export function createDm(token: string, uIds: number[]): number {
  const dm = POST(dmCreatePATH, {
    token: token,
    uIds: uIds
  });
  expect(dm.statusCode).toBe(OK);

  return BODY(dm).dmId;
}

/* get channel details */
export function channelDetails(token: string, channelId: number) {
  const channelDetails = GET(channelDetailsPATH, {
    token: token,
    channelId: channelId
  });

  expect(channelDetails.statusCode).toBe(OK);
  return BODY(channelDetails);
}

/* get dm details */
export function dmDetails(token: string, dmId: number) {
  const dmDetails = GET(dmDetailsPATH, {
    token: token,
    dmId: dmId
  });

  expect(dmDetails.statusCode).toBe(OK);
  return BODY(dmDetails);
}

/* sends message to a channel */
export function sendMessage(token: string, channelId: number, messageString: string): number {
  const message = POST(messageSendPATH, {
    token: token,
    channelId: channelId,
    message: messageString
  });

  expect(message.statusCode).toBe(OK);
  return BODY(message).messageId;
}

/* sends message to a dm */
export function sendDmMessage(token: string, dmId: number, messageString: string): number {
  const message = POST(messageSendDmPATH, {
    token: token,
    dmId: dmId,
    message: messageString
  });

  expect(message.statusCode).toBe(OK);
  return BODY(message).messageId;
}

/* sends message to a dm at a later time */
export function sendLater(token: string, channelId: number, messageString: string, timeSent: number): number {
  const message = POST(messageSendLaterPATH, {
    token: token,
    channelId: channelId,
    message: messageString,
    timeSent: timeSent
  });

  expect(message.statusCode).toBe(OK);
  return BODY(message).messageId;
}

/* user joins a public channel */
export function joinChannel(token: string, channelId: number) {
  const join = POST(channelJoinPATH, {
    token: token,
    channelId: channelId
  });
  expect(join.statusCode).toBe(OK);
}

/* user leaves a channel */
export function leaveChannel(token: string, channelId: number) {
  const leave = POST(channelLeavePATH, {
    token: token,
    channelId: channelId
  });
  expect(leave.statusCode).toBe(OK);
}

/* user leaves a dm */
export function leaveDm(token: string, dmId: number) {
  const leave = POST(dmLeavePATH, {
    token: token,
    dmId: dmId
  });
  expect(leave.statusCode).toBe(OK);
}

/* returns the messages in a dm */
export function getDmMessage(token: string, dmId: number) {
  const dmMessages = GET(dmMessagesPATH, {
    token: token,
    dmId: dmId,
    start: 0
  });

  expect(dmMessages.statusCode).toBe(OK);
  return BODY(dmMessages).messages;
}

/* deletes a message in dm or channel */
export function removeMessage(token: string, messageId: number) {
  const response = DELETE(messageRemovePATH, {
    token: token,
    messageId: messageId,
  });

  expect(response.statusCode).toBe(OK);
  return response
}

/* returns the messages in a channel */
export function getMessage(token: string, channelId: number) {
  const channelMessages = GET(channelMessagesPATH, {
    token: token,
    channelId: channelId,
    start: 0
  });

  expect(channelMessages.statusCode).toBe(OK);
  return BODY(channelMessages).messages;
}

/* reacts to a message */
export function reactMessage(token: string, messageId: number, reactId: number) {
  const react1 = POST(messageReactPATH, {
    token: token,
    messageId: messageId,
    reactId: reactId
  });
  expect(react1.statusCode).toBe(OK);
}

/* pins a message */
export function pinMessage(token: string, messageId: number) {
  const pin1 = POST(messagePinPATH, {
    token: token,
    messageId: messageId
  });
  expect(pin1.statusCode).toBe(OK);
}

export function channelInvite(token: string, channelId: number, uId: number) {
  const invited = POST(channelInvitePATH, {
    token: token,
    channelId: channelId,
    uId: uId,
  });
  expect(invited.statusCode).toBe(OK);
}

export function messageEdit(token: string, messageId: number, newMessage: string) {
  const edit = PUT(messageEditPATH, {
    token: token,
    messageId: messageId,
    message: newMessage
  })
  expect(edit.statusCode).toBe(OK);
}

export function messageShare(token: string, ogMessageId: number, channelId: number, dmId: number, message?: string) {
  const share = POST(messageSharePATH, {
    token: token,
    ogMessageId: ogMessageId,
    channelId: channelId,
    dmId: dmId,
    message: message,
  })
  expect(share.statusCode).toBe(OK);
}

