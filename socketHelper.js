import { WebSocketServer } from 'ws'
import events from 'events'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { conn } from './dbconnecter.js'
// eventemmitter so socket can notify clients of new messages
const socketEvents = new events.EventEmitter();
export default socketEvents;

export let clients = []; // all **loged in** clients

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
        for (let i = 0; i < clients.length; i++) {
            clients[i][0].send(JSON.stringify({id: id, channel: channel, method: method, type: "new_message"}))
        }
    })
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
        ws.send("invalid token or malformed packet")
        ws.close()
    }
}

export async function direct_message(clients, target_user, senderid, content) {
    try {
            console.log("Direct Message from (userid): " + senderid + ", to: " + target_user)
            const [result] = await conn.query("SELECT name, handle FROM User WHERE id = ?", [senderid])
            for (let i = 0; i < clients.length; i++) {
                if (clients[i][1].userID == target_user) {
                clients[i][0].send(JSON.stringify({
                    id: 0,
                    senderid: senderid,
                    content: content,
                    reactions: [],
                    encrypted: 0,
                    iv: null,
                    type: "direct_message",
                    name: "Direct Message: " + result[0].name,
                    handle: result[0].handle,
                    name_color: "#ffcc00ff",
                    channelid: 0,
                    date: new Date()
                }));
                return true;
        }
    }
    return false;

    } catch (error) {
        console.error(error)
        return false
    }
}