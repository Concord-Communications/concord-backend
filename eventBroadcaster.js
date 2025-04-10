// for events like @mentions, message deletes, message updates
const events = require('events')
class UserEvents extends events.EventEmitter {}
const userevents = new UserEvents();

module.exports = userevents