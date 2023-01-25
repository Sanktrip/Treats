import fs from 'fs';
import path from 'path';

import { getData } from './dataStore';
import { validateToken } from './tokens';

// userStats interfaces
export interface userChDataPointTYPE {
  numChannelsJoined: number,
  timeStamp: number
}

export interface userDmDataPointTYPE {
  numDmsJoined: number,
  timeStamp: number
}

export interface userMgDataPointTYPE {
  numMessagesSent: number,
  timeStamp: number
}

export interface userStatsTYPE {
  channelsJoined: userChDataPointTYPE[],
  dmsJoined: userDmDataPointTYPE[],
  messagesSent: userMgDataPointTYPE[],
  involvementRate: number
}

// usersStats interfaces
export interface serverChDataPointTYPE {
  numChannelsExist: number,
  timeStamp: number
}

export interface serverDmDataPointTYPE {
  numDmsExist: number,
  timeStamp: number
}

export interface serverMgDataPointTYPE {
  numMessagesExist: number,
  timeStamp: number
}

export interface serverStatsTYPE {
  channelsExist: serverChDataPointTYPE[],
  dmsExist: serverDmDataPointTYPE[],
  messagesExist: serverMgDataPointTYPE[],
  utilizationRate: number
}

// PATH constants
const serverLogPATH = './stats/serverlog.json';
const userLogsPATH = './stats/userlogs/';
const userLogsFPATH = './stats/userlogs';

// newLogMessage may be removed if issues occur
const newLogMessage = 'Log creation time: ';

// userStats start data points
const startUChDataPoint: userChDataPointTYPE = {
  numChannelsJoined: 0,
  timeStamp: 0,
};

const startUDmDataPoint: userDmDataPointTYPE = {
  numDmsJoined: 0,
  timeStamp: 0,
};

const startUMgDataPoint: userMgDataPointTYPE = {
  numMessagesSent: 0,
  timeStamp: 0,
};

const userLogStart: userStatsTYPE = {
  channelsJoined: [startUChDataPoint],
  dmsJoined: [startUDmDataPoint],
  messagesSent: [startUMgDataPoint],
  involvementRate: 0
};

// usersStats start data points
const startSChDataPoint: serverChDataPointTYPE = {
  numChannelsExist: 0,
  timeStamp: 0,
};

const startSDmDataPoint: serverDmDataPointTYPE = {
  numDmsExist: 0,
  timeStamp: 0,
};

const startSMgDataPoint: serverMgDataPointTYPE = {
  numMessagesExist: 0,
  timeStamp: 0,
};

const serverLogStart: serverStatsTYPE = {
  channelsExist: [startSChDataPoint],
  dmsExist: [startSDmDataPoint],
  messagesExist: [startSMgDataPoint],
  utilizationRate: 0
};

// ==============
// main functions
// ==============

function getUserStats(Id: number): { userStats: userStatsTYPE } {
  return { userStats: JSON.parse(String(fs.readFileSync(getUserPath(Id)))) };
}

function getUsersStats(): { workspaceStats: serverStatsTYPE } {
  return { workspaceStats: JSON.parse(String(fs.readFileSync(serverLogPATH))) };
}

// ===============================
// update functions
// -------------------------------
// called whenever a change occurs
// ===============================

// need to add these functions to all relevant functions called in server.ts (or where ever)

function updateUserlog(updatePoint: string, token: string, passedId = 0) {
  let Id;
  if (passedId === 0) {
    Id = validateToken(token);
  } else {
    Id = passedId;
  }
  const userPath = getUserPath(Id);
  if (!(fs.existsSync(userPath))) {
    startUserLog(Id);
  }
  switch (updatePoint) {
    case 'n':
      return;
    case 'c':
      updateChannels(userPath, Id);
      return;
    case 'd':
      updateDms(userPath, Id);
      return;
    case 'm':
      updateMessages(userPath, Id);
  }
}

function updateServerlog(updatePoint: string) {
  if (!(fs.existsSync(serverLogPATH))) {
    startServerLog();
    return;
  }
  switch (updatePoint) {
    case 'n':
      return;
    case 'c':
      updatesChannels();
      return;
    case 'd':
      updatesDms();
      return;
    case 'm':
      updatesMessages();
  }
}

// =================
// general functions
// =================

// returns current unix time
function getCurrentTime(): number {
  return Date.parse(new Date().toISOString()) / 1000;
}

// returns user's log file path
function getUserPath(Id: number): string {
  return path.join(userLogsPATH, Id + '.json');
}

// start log functions that display creation time at top of file
function startUserLog(Id: number) {
  fs.writeFileSync(getUserPath(Id), JSON.stringify(newLogMessage + getCurrentTime(), null, ' '));
  fs.writeFileSync(getUserPath(Id), JSON.stringify(userLogStart, null, 2));
}

function startServerLog() {
  fs.writeFileSync(serverLogPATH, JSON.stringify(newLogMessage + getCurrentTime(), null, ' '));
  fs.writeFileSync(serverLogPATH, JSON.stringify(serverLogStart, null, 2));
}

// !!! review function to make sure it works (and to make sure it doesnt delete everything non-log file)
// can make it so then it searches for only .json files
// deletes all logs
// https://www.geeksforgeeks.org/node-js-fs-readdir-method/
// https://sebhastian.com/javascript-delete-file/
function resetLogs() {
  try {
    fs.unlinkSync(serverLogPATH);
    // fs.writeFileSync(serverLogPATH, '');
  } catch (err) {
    console.error('error deleting server log');
  }
  fs.readdir(userLogsFPATH, (error, files) => {
    try {
      files.forEach(file => {
        fs.unlinkSync(path.join(userLogsFPATH, file));
      });
    } catch (error) {
      console.log('error deleting files?');
    }
  }
  );
}

// =================================
// userStats { userStats } functions
// =================================

// !!! review function to make sure it works
function updateChannels(path: string, Id: number) {
  // creates new data point
  const newDataPoint: userChDataPointTYPE = {
    numChannelsJoined: numChannelsJoined(Id),
    timeStamp: getCurrentTime(),
  };
  // adds new data point to user log
  const userlogFile = JSON.parse(String(fs.readFileSync(path)));
  userlogFile.channelsJoined.push(newDataPoint);
  // calculates new ultilization rate
  userlogFile.involvementRate = calInvolvementRate(Id);
  // writes new data to user log
  fs.writeFileSync(path, JSON.stringify(userlogFile, null), { flag: 'w' });
}

// !!! review function to make sure it works
// can replace stuff with dmListV1
function updateDms(path: string, Id: number) {
  // creates new data point
  const newDataPoint: userDmDataPointTYPE = {
    numDmsJoined: numDmsJoined(Id),
    timeStamp: getCurrentTime(),
  };
  // adds new data point to user log
  const userlogFile = JSON.parse(String(fs.readFileSync(path)));
  userlogFile.dmsJoined.push(newDataPoint);
  // calculates new ultilization rate
  userlogFile.involvementRate = calInvolvementRate(Id);
  // writes new data to user log
  fs.writeFileSync(path, JSON.stringify(userlogFile, null), { flag: 'w' });
}

// !!! review function to make sure it works
function updateMessages(path: string, Id: number) {
  // gets user data
  const userlogFile = JSON.parse(String(fs.readFileSync(path)));
  const newMessageData = Object.keys(userlogFile.messagesSent).length;
  // creates new data point
  const newDataPoint: userMgDataPointTYPE = {
    numMessagesSent: newMessageData,
    timeStamp: getCurrentTime(),
  };
  // adds new data point to user log
  userlogFile.messagesSent.push(newDataPoint);
  // calculates new involvement rate
  userlogFile.involvementRate = calInvolvementRate(Id);
  // writes new data to server log
  fs.writeFileSync(path, JSON.stringify(userlogFile, null), { flag: 'w' });
}

// !!! review function to make sure it works
function numChannelsJoined(Id: number): number {
  const dataStore = getData();
  let count = 0;
  for (const channel of dataStore.channels) {
    for (let member = 0; member < channel.members.length; member++) {
      if (channel.members[member] === Id) {
        count++;
      }
    }
  }
  return count;
}

// !!! review function to make sure it works
function numDmsJoined(Id: number): number {
  const dataStore = getData();
  let count = 0;
  for (const dm of dataStore.dms) {
    for (let member = 0; member < dm.members.length; member++) {
      if (dm.members[member] === Id) {
        count++;
      }
    }
  }
  return count;
}

// !!! review function to make sure it works
function numMsgsSent(Id: number): number {
  const dataStore = getData();
  const numMsgs = Object.keys(dataStore.messages).length;
  let count = 0;
  for (let message = 0; message < numMsgs; message++) {
    if (dataStore.messages[message].uId === Id) {
      count++;
    }
  }
  return count;
}

// !!! review function to make sure it works
function calInvolvementRate(Id: number): number {
  const dataStore = getData();
  const numChannels = Object.keys(dataStore.channels).length;
  const numDms = Object.keys(dataStore.dms).length;
  const numMsgs = Object.keys(dataStore.messages).length;
  const dSum = numChannels + numDms + numMsgs;
  if (dSum === 0) {
    return 0;
  }
  const nSum = numChannelsJoined(Id) + numDmsJoined(Id) + numMsgsSent(Id);
  const rate = nSum / dSum;
  if (rate > 1) {
    return 1;
  }
  return rate;
}

// =======================================
// usersStats { workspaceStats } functions
// =======================================

// !!! review function to make sure it works
function updatesChannels () {
  const dataStore = getData();
  // gets new length of channels
  const newChannelData = Object.keys(dataStore.channels).length;
  // creates new data point
  const newDataPoint: serverChDataPointTYPE = {
    numChannelsExist: newChannelData,
    timeStamp: getCurrentTime(),
  };
  // adds new data point to server log
  const serverlogFile = JSON.parse(String(fs.readFileSync(serverLogPATH)));
  serverlogFile.channelsExist.push(newDataPoint);
  // calculates new ultilization rate
  serverlogFile.utilizationRate = calUtilizationRate();
  // writes new data to server log
  fs.writeFileSync(serverLogPATH, JSON.stringify(serverlogFile, null), { flag: 'w' });
}

// !!! review function to make sure it works
function updatesDms () {
  const dataStore = getData();
  // gets new length of channels
  const newDmsData = Object.keys(dataStore.dms).length;
  // creates new data point
  const newDataPoint: serverDmDataPointTYPE = {
    numDmsExist: newDmsData,
    timeStamp: getCurrentTime(),
  };
  // adds new data point to server log
  const serverlogFile = JSON.parse(String(fs.readFileSync(serverLogPATH)));
  serverlogFile.dmsExist.push(newDataPoint);
  // calculates new ultilization rate
  serverlogFile.utilizationRate = calUtilizationRate();
  // writes new data to server log
  fs.writeFileSync(serverLogPATH, JSON.stringify(serverlogFile, null), { flag: 'w' });
}

// !!! review function to make sure it works
function updatesMessages () {
  const dataStore = getData();
  // gets new length of channels
  const newMessagesData = Object.keys(dataStore.messages).length;
  // creates new data point
  const newDataPoint: serverMgDataPointTYPE = {
    numMessagesExist: newMessagesData,
    timeStamp: getCurrentTime(),
  };
  // adds new data point to server log
  const serverlogFile = JSON.parse(String(fs.readFileSync(serverLogPATH)));
  serverlogFile.messagesExist.push(newDataPoint);
  // calculates new ultilization rate
  serverlogFile.utilizationRate = calUtilizationRate();
  // writes new data to server log
  fs.writeFileSync(serverLogPATH, JSON.stringify(serverlogFile, null), { flag: 'w' });
}

// !!! review function to make sure it works
function activeUsers (): number {
  /**
   * has to go through every channel
   * finds all users that have joined at least one dm or channel
  */
  const dataStore = getData();
  const activeUsers: number[] = [];
  for (const channel of dataStore.channels) {
    for (let user = 0; user < Object.keys(channel.members).length; user++) {
      if (!(activeUsers.includes(channel.members[user]))) {
        activeUsers.push(user);
      }
    }
  }
  for (const dm of dataStore.dms) {
    for (let user = 0; user < Object.keys(dm.members).length; user++) {
      if (!(activeUsers.includes(dm.members[user]))) {
        activeUsers.push(user);
      }
    }
  }
  const uniqueActiveUsers = [...new Set(activeUsers)];

  return uniqueActiveUsers.length;
}

// !!! review function to make sure it works
function calUtilizationRate(): number {
  const dataStore = getData();
  const numUsers = Object.keys(dataStore.users).length;
  if (numUsers === 0) {
    return 0;
  }
  return activeUsers() / numUsers;
}

export { getUserStats, getUsersStats, updateServerlog, updateUserlog, resetLogs };
