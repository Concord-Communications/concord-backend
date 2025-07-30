// for events like @mentions, message deletes, message updates
import events from 'events'
class UserEvents extends events.EventEmitter {}
export const userevents = new UserEvents();