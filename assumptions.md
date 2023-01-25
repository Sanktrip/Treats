### assumptions to be marked
------------------------------------------
1. if any function receives an invalid authUserId as input, it should return **ERROR**
2. the order of any array returned by a function does not matter (e.g. channels returned from `channelsListV1`, `channelsListallV1`, users inside the owners or members array returned by `channelDetailsV1`)
3. when registering a user (using `authRegisterV1`), if the first / last names inputted contain only illegal characters, such that the handleStr generated will be empty (i.e., of length = 0) since special characters are removed, return an **ERROR**
4. new channels are allowed to be created with the exact same name and information, as long as they have unique channelId's (i.e., the existing channels in the dataStore themselves do not impact the validity of new channels being created, except that the new channel must have a unique channelId)
5. the specification states that the user who creates a channel "automatically joins the channel" - this has been intepreted being added as BOTH a member and an owner of the channel, regardless of the user's global permissions etc.
6. there is currently no way to add messages to any channel and thus, given no errors, channelMessages always returns `{ messages: [], start: 0, end: -1 }`
------------------------------------------

### authRegisterV1
- if the first / last names inputted contain all special characters, such that the handleStr generated will be empty (i.e., of length = 0) since special characters are removed, return an **ERROR**

### channelsCreateV1
- channels are allowed to be created with the exact same name and information, so long as they have unique channelId's
- the spec says that the user who creates a channel "automatically joins the channel" - this has been intepreted being added as BOTH a member and an owner of the channel

### channelsListV1
- when the channelsListV1 function receives an invalid userId, it should return an error (as opposed to an empty array)
- the order of the channels in the `channels` array doesn't matter

### channelJoinV1
- Any users can join any public channel by themselves, but they can only join private channels by invitation from the owner or member of the channel unless they are global permission owners.
- The authUserId will be added to the channel as a member after the user joins in.
 
### channelInviteV1
- Besides the owner of a channel, any members in the channel could invite any existing users as well, unless the invited user is already a member of the channel.
- The uId will be added to the channel as a member after the user is invited and join in.

### channelsListallV1
- channelsListallV1 should check if the inputted authUserId is valid, and if the input is invalid the function should return  **ERROR**
- Assume that the order of the returned list of channels does not matter

### channelMessagesV1
- there is currently no way to add messages to any channel and thus, given no errors, channelMessages always returns `{ messages: [], start: 0, end: -1 }`