import config from '../config.json';
import request, { Response } from 'sync-request';

const port = config.port;
const url = config.url;

// auth
export const authRegisterPATH = 'auth/register/v3';
export const authLoginPATH = 'auth/login/v3';
export const authLogoutPATH = 'auth/logout/v2';
export const authPasswordResetRequestPATH = 'auth/passwordreset/request/v1';
export const authPasswordresetResetPATH = 'auth/passwordreset/reset/v1';

//admin
export const adminUserRemovePATH = 'admin/user/remove/v1';
export const adminUserpermissionChangePATH = 'admin/userpermission/change/v1';


// clear
export const clearPATH = 'clear/v1';

// dms
export const dmCreatePATH = 'dm/create/v2';
export const dmListPATH = 'dm/list/v2';
export const dmDetailsPATH = 'dm/details/v2';
export const dmLeavePATH = 'dm/leave/v2';
export const dmMessagesPATH = 'dm/messages/v2';
export const dmRemovePATH = 'dm/remove/v2';

// users
export const userProfilePATH = 'user/profile/v3';
export const usersAllPATH = 'users/all/v2';
export const userProfileSetnamePATH = 'user/profile/setname/v2';
export const userProfileSethandlePATH = 'user/profile/sethandle/v2';
export const userProfileSetemailPATH = 'user/profile/setemail/v2';
export const userStatsPATH = 'user/stats/v1';
export const usersStatsPATH = 'users/stats/v1';
export const userProfileUploadImgPATH = 'user/profile/uploadphoto/v1';

// channels
export const channelsCreatePATH = 'channels/create/v3';
export const channelsListPATH = 'channels/list/v3';
export const channelsListallPATH = 'channels/listall/v3';

// channel
export const channelJoinPATH = 'channel/join/v3';
export const channelInvitePATH = 'channel/invite/v3';
export const channelMessagesPATH = 'channel/messages/v3';
export const channelAddownerPATH = 'channel/addowner/v2';
export const channelLeavePATH = 'channel/leave/v2';
export const channelRemoveownerPATH = 'channel/removeowner/v2';
export const channelDetailsPATH = 'channel/details/v3';

//  message
export const messageSendPATH = 'message/send/v2';
export const messageSendDmPATH = 'message/senddm/v2';
export const messageRemovePATH = 'message/remove/v2';
export const messageEditPATH = 'message/edit/v2';
export const messageSharePATH = 'message/share/v1';
export const messageReactPATH = 'message/react/v1';
export const messageUnreactPATH = 'message/unreact/v1';
export const messagePinPATH = 'message/pin/v1';
export const messageUnpinPATH = 'message/unpin/v1';
export const messageSendLaterPATH = 'message/sendlater/v1';
export const messagesendLaterDmPATH = 'message/sendlaterdm/v1';
export const searchPATH = 'search/v1';

// notifications
export const notificationsGetPATH = 'notifications/get/v1';

//standup
export const standupStartPATH = 'standup/start/v1';
export const standupActivePATH = 'standup/active/v1';
export const standupSendPATH = 'standup/send/v1';


// !!! each function will run the corresponding HTTP requests and return the 'res' object !!! //

/**
 * GET request on web server with given path and parameters
 *
 * ARGUMENTS:
 * @param path of the route that we are calling
 * @param qs object with arguments of request passed as input
 *
 * RETURN VALUE:
 * @returns res object returned by the server
 */
const GET = (path: string, qs: Record<string, unknown>) => {
  const token = qs.token as string;

  delete qs.token;

  return request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: token
      }
    }
  );
};

/**
 * DELETE request on web server with given path and parameters
 *
 * ARGUMENTS:
 * @param path of the route that we are calling
 * @param qs object with arguments of request passed as input
 *
 * RETURN VALUE:
 * @returns res object returned by the server
 */
const DELETE = (path: string, qs: Record<string, unknown>) => {
  const token = qs.token as string;

  delete qs.token;

  return request(
    'DELETE',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: token
      }
    }
  );
};

/**
 * POST request on web server with given path and parameters
 *
 * ARGUMENTS:
 * @param path of the route that we are calling
 * @param body object with arguments of request passed as input
 *
 * RETURN VALUE:
 * @returns res object returned by the server
 */
const POST = (path: string, body: Record<string, unknown>) => {
  const token = body.token as string;

  delete body.token;

  return request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        token: token
      }
    }
  );
};

/**
 * PUT request on web server with given path and parameters
 *
 * ARGUMENTS:
 * @param path of the route that we are calling
 * @param body object with arguments of request passed as input
 *
 * RETURN VALUE:
 * @returns res object returned by the server
 */
const PUT = (path: string, body: Record<string, unknown>) => {
  const token = body.token as string;

  delete body.token;

  return request(
    'PUT',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        token: token
      }
    }
  );
};

/**
 * gets the body object from a http response
 *
 * ARGUMENTS:
 * @param res response returned from http CRUD operation
 *
 * RETURN VALUE:
 * @returns json object containing information returned from HTTP request
 */
const BODY = (res: Response) => JSON.parse(String(res.getBody()));

export { GET, DELETE, POST, PUT, BODY };
