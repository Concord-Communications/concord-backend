import { WebSocketServer } from 'ws'
import events from 'events'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { conn } from './dbconnecter.js'
// eventemmitter so socket can notify clients of new messages
const socketEvents = new events.EventEmitter();
export default socketEvents;

export let clients = {}; // all **loged in** clients
// clients need a unique key that doesn't change based off, otherwise I'd use an array
let clientIndex = 0 

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

        ws.on('message', async (msg) => {
            if (self === null) {
                return self = await handleLogin(ws, msg, clients) // returns the index
            }
            // if they don't have a login id don't let them i
            if (msg.length > 10) { return ws.send("input too large!") }
            if (msg.length == 0) { return ws.send("input cannot be empty!") }
            let channel = 1
            if (msg == "any") { 
                channel = true // if the channel is "true" than this client will get every channel's messages
            } else {
                channel = parseInt(msg)
                if (Number.isNaN(channel)) {return ws.send("bad request, not a number or \"any\" (string)")}
            }
            clients[self][2] = channel // third value (2nd index) is the relay channel to listen to
        })
        ws.on('error', (error) => {
            console.error(error);
            ws.close()
        })
        ws.on('close', () => {
            delete clients[self]
        })
        ws.on('pong', heartbeat)
    })

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) { 
                delete clients[self]
                self = null
                return ws.terminate(); 
            }
            ws.isAlive = false;
            ws.ping();
        })
    }, 3000)
    
    /*
         when the server receives a message, it will emmit this event, the socket should broadcast it to all clients who have access to the channel
    */
    socketEvents.on('message', async (id, method, channel) => {
        // methods are update, delete, create
        for (let key in clients) {
            clients[key][0].send(JSON.stringify({id: id, channel: channel, method: method, type: "new_message"}))
        }
    })

    socketEvents.on('relay', async (message, relayid) => {
        let res = JSON.stringify(message)
        for (let key in clients) {
            if (clients[key][2] != relayid && clients[key][2] !== true) continue;
            clients[key][0].send(res)
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
            clientIndex++
            clients[clientIndex] = [ws, decoded, 0] // websocket, login, relaychannel to listen to
            return clientIndex 
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
            for (let key in clientIndex) {
                if (clients[key][1].userID == target_user) {
                clients[key][0].send(JSON.stringify({
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