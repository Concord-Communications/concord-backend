import { WebSocketServer } from 'ws'
import events from 'events'
import jwt from 'jsonwebtoken'
import Joi from 'joi'

// eventemmitter so socket can notify clients of new messages
const socketEvents = new events.EventEmitter();
export default socketEvents;

export let clients = [];

export function serveConcordSocket() {
    function heartbeat() {
        this.isAlive = true;
    }

    const port = process.env.WEB_SOCKET_HELPER_PORT || 8081;
    const wss = new WebSocketServer({port: port})

    console.log(`Socket server started on port ${port}...`)


    wss.on('connection', (ws) => {
        let self = null;
        ws.isAlive = true;  
        // have the client authenticate
        // I don't my socket abilities very much, so currently the client is only allowed to send that authentication message
        ws.once('message', async (msg) => {
            self = handleLogin(ws, msg, clients)
        })
        ws.on('error', (error) => {
            console.error(error);
            ws.close()
        })
        ws.on('close', () => {
            clients.splice(self, 1)
        })
        ws.on('pong', heartbeat)
    })

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) { return ws.terminate(); }
            ws.isAlive = false;
            ws.ping();
        })
    }, 3000)
    
    /*
         when the server receives a message, it will emmit this event, the socket should broadcast it to all clients who have access to the channel
    */
    socketEvents.on('message', async (id, method, channel) => {
        console.log(`Broadcasting message`);
        // methods are update, delete, create
        //TODO: make this more efficient, it's currently O(n^2) yay for nested loops
        for (let i = 0; i < clients.length; i++) {
            if (!getUserChannelAuth(clients[i][1].channels, channel)) { continue; } // see if the user has access to this channel
            clients[i][0].send(JSON.stringify({id: id, channel: channel, method: method, type: "new_message"}))
        }
    })
}

function getUserChannelAuth(channels, id) {
    for (let i = 0; i < channels.length; i++) {
        if (channels[i] == id) {return true}
    }
    return false
}

async function handleLogin(ws, msg, clients) {
    const loginSchema = Joi.object({
        token: Joi.string().max(255).required()
    })
    try {
        msg = msg.toString()
        msg = JSON.parse(msg)
        const { value } = await loginSchema.validate(msg)
        try {
            const decoded = jwt.verify(value.token, process.env.JWT_SECRET)
            ws.send(JSON.stringify({error: false, message: "Authenticated! Welcome!"}))
            return clients.push([ws, decoded])
        } catch (e) {
            ws.send(JSON.stringify({error: true, message: "Unauthorized!!!"}))
            ws.close()
        }
    } catch (e) {
        ws.send(e.details[0].message)
        ws.close()
    }
}

export async function direct_message(clients, target_user, senderid, content) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i][1].id == target_user) {
            clients[i][0].send(JSON.stringify({
                id: senderid,
                content: content,
                type: "direct_message"
            }));
            return true;
        }
    }
    return false;
}