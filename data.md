```javascript
// TODO: insert your data structure that contains users + channels info here
// You may also add a short description explaining your design

///// all data types used are indicative /////


/*----- 
    there is also a variable called 'start' that is a parameter in the
    channelMessagesV1 function - what do you think that's about?
-----*/

let dataStore = {
  'users': { // array of user objects
    // user data structure
    'danielle123@gmail.com':               // email of user
      {
        'uId': 1,                           // unique user identifier
        'profilePic': 'shorturl.at/frxHK',  // path or url for profile pic
        'nameFirst': 'Daniel',              // first name of user
        'nameLast': 'Craig',                // last name of user
        'handleStr': 'danielcraig',         // display username for user
        'password': 'danielrocks123',       // user's password

         // extra stuff
        'userStatus': 1,                    // 1 = active, 0 = offline, 2 = busy
        'lastActive': 5,                    // minutes since last active
        'organisation': 'UNSW',             // organisation affiliated with user
      },
  },

  'channels': [ // array of channel objects
    // channel data structure
    {
      'channelId': 1,                    // unique channel identifier
      'channelName': 'Marketing Team',   // name for the channel
      'channelIcon': 'shorturl.at/frxHK' // path or url for channel icon
      'publicStatus': true,              // true = public, false = private
      'members': [ 1, 2, 3, ],           // array of uIds
      'admins': [ 1 ],                   // array of uIds; a subarray of 'members'
    
      ///// ask about this in the tut? /////
      'messages': [                      // ordered array of messages in channel
        {																 	 // each message is an object
          'message': 'hello world!', 		 // message content
          'author': 1,               		 // uId of author
          'timeSent': {
            'year': 2022,
            'month': 6,
            'date': 8,
            'hour': 23,            			 // 24hr time
            'min': 11,
          },
        },
      ],
    
      // extra stuff
      'dateCreated': {                   // object storing date channel created
        'year': 2022,
        'month': 6,
        'day': 8,
      },
    },
  ],
}

```