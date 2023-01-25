import fs from 'fs';

export interface userTYPE {
  uId: number,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  password: string,
  globalPermission: number,
  profileImgUrl: string,
}
export interface usersTYPE { [email: string]: userTYPE }

export interface removedUserTYPE {
  uId: number,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  password: string,
  globalPermission: number,
  profileImgUrl: string,
  email: string
}

export interface resetCodeTYPE { [email: string]: string}

export interface react {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
}

export interface messageTYPE {
  messageId: number,
  message: string,
  uId: number,
  timeSent: number, // UNIX time format
  isPinned: boolean,
  reacts: react[]
}
export interface channelTYPE {
  channelId: number,
  channelName: string,
  publicStatus: boolean,
  members: number[],
  owners: number[],
  messages: number[],
}
export type channelsTYPE = channelTYPE[];

export interface tokensTYPE {
  [token: string]: number
}

export interface dmTYPE {
  dmId: number,
  name: string,
  owner: number,
  members: number[],
  messages: number[] // array of message Ids
}
export type dmsTYPE = dmTYPE[];

export interface notificationTYPE {
  dmId: number,
  channelId: number,
  notificationMessage: string,
}
export interface notificationsTYPE { [uId: number]: notificationTYPE[] }

export interface standupTYPE {
  channelId: number,
  isActive: boolean,
  creator: number | null,
  message: string[],
  timeFinish: number | null
}

export interface dataTYPE {
  users: usersTYPE,
  channels: channelsTYPE,
  tokens: tokensTYPE,
  dms: dmsTYPE,
  messages: messageTYPE[];
  notifications: notificationsTYPE;
  standup: standupTYPE[],
  resetCode: resetCodeTYPE,
  removedUsers: removedUserTYPE[]
}

export const GLOBAL_OWNER = 1;
export const GLOBAL_MEMBER = 2;

export const EMPTY_DATASTORE: dataTYPE = {
  users: {},
  channels: [],
  tokens: {},
  dms: [],
  messages: [],
  notifications: {},
  standup: [],
  resetCode: {},
  removedUsers: []
};

/*
SAMPLE DATA STRUCTURE

let data: dataTYPE = {
  users: {
    'daniel123@gmail.com': {
      uId: 1,
      nameFirst: 'Daniel',
      nameLast: 'Craig',
      handleStr: 'danielcraig',
      password: 'danielrocks123',
      globalPermission: 1, // first user who registers is '1' (owner), everyone else is '2'
    },
  },

  channels: [
    {
      channelId: 1,
      channelName: 'Marketing Team',
      publicStatus: true,
      members: [1, 2, 3],
      owners: [1],

      messages: [1], // array of message Ids
    },
  ],

  tokens: {
    '392-8329-dh83n': 1,
  },

  dms: [
    {
      dmId: 1,
      name: 'danielcraig, sankalpatripathee',
      owner: 1,
      members: [1, 2],
      messages: []
    },
  ],

  messages: [
    {
      messageId: 1,
      message: 'hello world!',
      uId: 1,
      timeSent: 1332042634, // UNIX time format
    },
  ]

  notifications: {
    1: [{
      dmId: -1,
      channelId: 4,
      notificationMessage: 'haydensmith added you to the Marketing Team'
    }
    ]
  }

};
*/

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

const dataStorePath = './dataStore.json';

// Use get() to access the data
function getData(): dataTYPE {
  // if no data file exists
  /* if (!(fs.existsSync(dataStorePath))) {
    fs.writeFileSync(dataStorePath, JSON.stringify(EMPTY_DATASTORE, null, 4));
  } */

  const dataStore: dataTYPE = JSON.parse(String(fs.readFileSync(dataStorePath)));

  return dataStore;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataTYPE) {
  // if no data file exists
  /* if (!(fs.existsSync(dataStorePath))) {
    fs.writeFileSync(dataStorePath, JSON.stringify(EMPTY_DATASTORE, null, 4));
  } */

  fs.writeFileSync(dataStorePath, JSON.stringify(newData, null, 4));
}

export { getData, setData };
