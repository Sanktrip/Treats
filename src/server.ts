import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { authRegisterV1, authLoginV1, authLogoutV1, authPasswordResetRequestV1, authPasswordresetResetV1 } from './auth';
import { dmCreateV1, dmListV1, dmDetailsV1, dmLeaveV1, dmRemoveV1 } from './dm';
import { clearV1 } from './other';
import { userProfileV2, usersAllV1, userProfileSetemailV1, userProfileSethandleV1, userProfileSetnameV1, userStatsV1, usersStatsV1 } from './users';
import { notificationsGetV1 } from './notifications';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { channelJoinV1, channelDetailsV1, channelInviteV1, channelLeaveV1, channelAddownerV1, channelRemoveownerV1, channelMessagesV1 } from './channel';
import { sendDmV1, dmMessagesV1, messageSendV1, messageRemoveV1, messageEditV1, messageShareV1, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1, messageSendLaterV1, searchV1, messageSendLaterDmV1 } from './message';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';
import { adminUserpermissionChangeV1, adminUserRemoveV1 } from './admin';
import { uploadPhotoV1 } from './profileImg';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

// for logging all http requests
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// serve profile images
app.use('/static', express.static('src/profileImgs'));

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// auth
app.post('/auth/register/v3', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.post('/auth/login/v3', (req, res) => {
  const { email, password } = req.body;
  res.json(authLoginV1(email, password));
});

app.post('/auth/logout/v2', (req, res) => {
  const token = req.headers.token as string;
  res.json(authLogoutV1(token));
});

app.post('/auth/passwordreset/request/v1', (req, res) => {
  const email = req.body.email as string;
  res.json(authPasswordResetRequestV1(email));
});

app.post('/auth/passwordreset/reset/v1', (req, res) => {
  const { resetCode, newPassword } = req.body;
  res.json(authPasswordresetResetV1(resetCode, newPassword));
});

// admin
app.post('/admin/userpermission/change/v1', (req, res) => {
  const token = req.headers.token as string;
  const { uId, permissionId } = req.body;
  res.json(adminUserpermissionChangeV1(token, uId, permissionId));
});

app.delete('/admin/user/remove/v1', (req, res) => {
  const token = req.headers.token as string;
  const uId = parseInt(req.query.uId as string) as number;
  res.json(adminUserRemoveV1(token, uId));
});

// clear
app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

// users
app.get('/user/profile/v3', (req, res) => {
  const uId = parseInt(req.query.uId as string, 10) as number;
  const token = req.headers.token as string;
  res.json(userProfileV2(token, uId));
});

app.get('/users/all/v2', (req, res) => {
  const token = req.headers.token as string;
  res.json(usersAllV1(token));
});

app.put('/user/profile/setemail/v2', (req, res) => {
  const token = req.headers.token as string;
  const email = req.body.email as string;
  res.json(userProfileSetemailV1(token, email));
});

app.put('/user/profile/sethandle/v2', (req, res) => {
  const token = req.headers.token as string;
  const handleStr = req.body.handleStr as string;
  res.json(userProfileSethandleV1(token, handleStr));
});

app.put('/user/profile/setname/v2', (req, res) => {
  const token = req.headers.token as string;
  const nameFirst = req.body.nameFirst as string;
  const nameLast = req.body.nameLast as string;
  res.json(userProfileSetnameV1(token, nameFirst, nameLast));
});

app.get('/user/stats/v1', (req, res) => {
  const token = req.headers.token as string;
  res.json(userStatsV1(token));
});

app.get('/users/stats/v1', (req, res) => {
  const token = req.headers.token as string;
  res.json(usersStatsV1(token));
});

app.post('/user/profile/uploadphoto/v1', (req, res) => {
  const token = req.headers.token as string;
  const imgUrl = req.body.imgUrl as string;
  const xStart = req.body.xStart as number;
  const yStart = req.body.yStart as number;
  const xEnd = req.body.xEnd as number;
  const yEnd = req.body.yEnd as number;
  res.json(uploadPhotoV1(token, imgUrl, xStart, yStart, xEnd, yEnd));
});

// channels
app.post('/channels/create/v3', (req, res) => {
  const token = req.headers.token as string;
  const name = req.body.name as string;
  const isPublic = req.body.isPublic as boolean;
  res.json(channelsCreateV1(token, name, isPublic));
});

app.get('/channels/list/v3', (req, res) => {
  const token = req.headers.token as string;
  res.json(channelsListV1(token));
});

app.get('/channels/listall/v3', (req, res) => {
  const token = req.headers.token as string;
  res.json(channelsListallV1(token));
});

// dms
app.get('/dm/list/v2', (req, res) => {
  const token = req.headers.token as string;
  res.json(dmListV1(token));
});

app.post('/dm/create/v2', (req, res) => {
  const token = req.headers.token as string;
  const { uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
});

app.get('/dm/details/v2', (req, res) => {
  const token = req.headers.token as string;
  const dmId = parseInt(req.query.dmId as string) as number;
  res.json(dmDetailsV1(token, dmId));
});

app.post('/dm/leave/v2', (req, res) => {
  const token = req.headers.token as string;
  const { dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
});

app.get('/dm/messages/v2', (req, res) => {
  const token = req.headers.token as string;
  const dmId = parseInt(req.query.dmId as string) as number;
  const start = parseInt(req.query.start as string) as number;
  res.json(dmMessagesV1(token, dmId, start));
});

app.delete('/dm/remove/v2', (req, res) => {
  const token = req.headers.token as string;
  const dmId = parseInt(req.query.dmId as string) as number;
  res.json(dmRemoveV1(token, dmId));
});

// channel
app.get('/channel/details/v3', (req, res) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string, 10) as number;
  res.json(channelDetailsV1(token, channelId));
});

app.post('/channel/join/v3', (req, res) => {
  const token = req.headers.token as string;
  const { channelId } = req.body;
  res.json(channelJoinV1(token, channelId));
});

app.post('/channel/invite/v3', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  res.json(channelInviteV1(token, channelId, uId));
});

app.get('/channel/messages/v3', (req, res) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string, 10) as number;
  const start = parseInt(req.query.start as string, 10) as number;
  res.json(channelMessagesV1(token, channelId, start));
});

app.post('/channel/leave/v2', (req, res) => {
  const token = req.headers.token as string;
  const { channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v2', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  res.json(channelAddownerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, uId } = req.body;
  res.json(channelRemoveownerV1(token, channelId, uId));
});

// messages
app.put('/message/edit/v2', (req, res) => {
  const token = req.headers.token as string;
  const { messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
});

app.post('/message/send/v2', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message));
});

app.delete('/message/remove/v2', (req, res) => {
  const token = req.headers.token as string;
  const messageId = parseInt(req.query.messageId as string, 10) as number;
  res.json(messageRemoveV1(token, messageId));
});

app.post('/message/senddm/v2', (req, res) => {
  const token = req.headers.token as string;
  const { dmId, message } = req.body;
  res.json(sendDmV1(token, dmId, message));
});

app.post('/message/share/v1', (req, res) => {
  const token = req.headers.token as string;
  const { ogMessageId, message, channelId, dmId } = req.body;
  res.json(messageShareV1(token, ogMessageId, channelId, dmId, message));
});

app.post('/message/react/v1', (req, res) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req, res) => {
  const token = req.headers.token as string;
  const { messageId, reactId } = req.body;
  res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/message/pin/v1', (req, res) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  res.json(messagePinV1(token, messageId));
});

app.post('/message/unpin/v1', (req, res) => {
  const token = req.headers.token as string;
  const { messageId } = req.body;
  res.json(messageUnpinV1(token, messageId));
});

app.post('/message/sendlater/v1', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, message, timeSent } = req.body;
  res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req, res) => {
  const token = req.headers.token as string;
  const { dmId, message, timeSent } = req.body;
  res.json(messageSendLaterDmV1(token, dmId, message, timeSent));
});

// notifications
app.get('/notifications/get/v1', (req, res) => {
  const token = req.headers.token as string;
  res.json(notificationsGetV1(token));
});

// standups
app.post('/standup/start/v1', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, length } = req.body;
  res.json(standupStartV1(token, channelId, length));
});

app.get('/standup/active/v1', (req, res) => {
  const token = req.headers.token as string;
  const channelId = parseInt(req.query.channelId as string, 10) as number;
  res.json(standupActiveV1(token, channelId));
});

app.post('/standup/send/v1', (req, res) => {
  const token = req.headers.token as string;
  const { channelId, message } = req.body;
  res.json(standupSendV1(token, channelId, message));
});

// search
app.get('/search/v1', (req, res) => {
  const token = req.headers.token as string;
  const queryStr = req.query.queryStr as string;
  res.json(searchV1(token, queryStr));
});

// profile url
app.get('/src/profileImgs/:imagePath.jpg', (req, res) => {
  res.sendFile(`/profileImgs/${req.params.imagePath}.jpg`, { root: __dirname });
});

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
