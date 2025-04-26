import { WebSocketServer } from 'ws'
import events from 'events'
import jwt from 'jsonwebtoken'
import Joi from 'joi'

const socketEvents = new events.EventEmitter();
export default socketEvents;

export function serveConcordSocket() {

    const port = process.env.WEB_SOCKET_HELPER_PORT || 8081;
    const wss = new WebSocketServer({port: port})

    console.log(`Socket server started on port ${port}...`)

    let clients = [];

    wss.on('connection', (ws) => {
        let self = null;
        ws.send("This socket requires authentication, please log in")
        ws.once('message', async (msg) => {
            self = handleLogin(ws, msg, clients)
        })
        ws.on('error', (error) => {
            console.error(error);
            ws.close()
        })
        ws.on('close', () => {
            if (self === null) {
                return console.warn("Client closed without authentication!")
            }
            clients.splice(self, 1)
        })
    })

    socketEvents.on('message', async (message, method, channel) => {
        console.log(`Broadcasting message`);
        // methods are update, delete, create
        for (let i = 0; i < clients.length; i++) {
            if (!getUserChannelAuth(clients[i][1].channels, channel)) {
                continue;
            }
            clients[i][0].send(JSON.stringify({message: message, method: method}))
        }
    })
}

function getUserChannelAuth(channels, id) {
    for (let i = 0; i < channels.length; i++) {
        if (channels[i] === id) {return true}
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
            ws.send("Authenticated! Welcome!")
            return clients.push([ws, decoded])
        } catch (e) {
            ws.send("Unauthorized!")
            ws.close()
        }
    } catch (e) {
        ws.send(e.details[0].message)
        ws.close()
    }

}