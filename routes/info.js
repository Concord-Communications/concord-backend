// This file is intended to be used for the "/api/info/*" route
import express from 'express'
import { conn } from '../dbconnecter.js'
import {authenticate} from "../middleware/auth-helper.js";

export const router = express.Router()

function userChannelPermitted(id, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == id) {
            return true
        }
    }
    return false
}


router.get("/channel/permitted/:channel", authenticate, async (req, res) => {
    const channel = parseInt(req.params.channel);
    res.send(userChannelPermitted(channel, req.user.channels))
})

router.get('/channels/:channel', async (req, res) => {
    // send the id of the latest message
    try {
        const [result] = await conn.execute('SELECT id, name, description FROM channels WHERE id=?',
        [parseInt(req.params.channel)])
        res.send(result)
    } catch (err) {
        res.status(500).send("internal server error")
        console.error(err)
        return
    }
})

router.get('/channels', authenticate, async (req, res) => {
    // show all available channels
    try {
        const [result] = await conn.execute(
            `SELECT channels.*, UserChannels.lastMessageid
             FROM channels LEFT JOIN UserChannels ON UserChannels.channelid=channels.id
             WHERE UserChannels.userid=?`,
            [parseInt(req.user.userID)])
        res.send(result)
    } catch (err) {
        res.status(500).send("internal server error")
        console.error(err)
        return
    }
})

router.get('/health', async (req, res) => {
    // show all users
    //TODO: make an optional choice to limit how many users queried
    res.status(200).send("Works on my machine.")
})

router.get('/users', authenticate, async (req, res) => {
    // show all users
    //TODO: make an optional choice to limit how many users queried
    const limit = parseInt(req.query.limit)
    let offset = parseInt(req.query.offset)
    if (!offset) {offset = 0}
    try {
        if (limit) {
            const [result] = await conn.execute(
                "SELECT id, name, handle, description, created, verified FROM User WHERE id >= ? LIMIT ?",
                [limit, offset]
            )
            res.send(result)
            return
        }
        const [result] = await conn.execute('SELECT id, name, handle, description, created, verified FROM User');
        res.send(result)
    }catch (err) {
        res.status(500).json("internal server error");
        console.error(err);
    }

})

router.get('/users/:userid', authenticate, async (req, res) => {
    // show the publicly available info about this user
    try {
        const [result] = await conn.execute(
            "SELECT id, name, handle, description, created, verified FROM User WHERE id = ?",
            [parseInt(req.params.userid)]
        )
        res.send(result)
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
        return
    }
})

async function getLastRead(req, res, channel, user) {
    if (!userChannelPermitted(channel, req.user.channels)) {return res.status(403).send("you don't have access to this channel")}
    try {
        const [result] = await conn.execute("SELECT channelid, lastMessageid FROM UserChannels WHERE userid = ? AND channelid = ?",
            [user, channel])
        if (result[0].lastMessageid == null) {
            return res.status(404).send("no record found")
        }
        res.send(result)
    } catch (e) {
        return res.status(500).json("internal server error");
    }
}

router.get('/me/lastread/:channel', authenticate, async (req, res) => {
    const target = parseInt(req.params.channel)
    await getLastRead(req, res, target, req.user.userID)
})

router.get('/lastread/:userid/:channel', authenticate, async (req, res) => {
    const target = parseInt(req.params.channel)
    const user = parseInt(req.params.userid)
    await getLastRead(req, res, target, user)
})

router.post('/me/lastread/:channel/:messageID', authenticate, async (req, res) => {
    const target = parseInt(req.params.channel)
    const newReadID = parseInt(req.params.messageID)
    if (!userChannelPermitted(target, req.user.channels)) {return res.status(403).send("you don't have access to this channel")}
    try {
        const [result] = await conn.execute("UPDATE UserChannels SET lastMessageid = ? WHERE userid = ? AND channelid = ?",
            [newReadID, req.user.userID, target])
        res.send({
            message: "Updated read time to",
            value: newReadID
        })
    } catch (e) {
        // if the id doesn't exist then it will crash
        res.status(500).json("internal server error");
    }
})

router.get('/me', authenticate, async (req, res) => {
    const userid = req.user.userID
    try {
        const [result] = await conn.execute(
            "SELECT id, name, handle, description, created, permissions, channels, verified FROM User WHERE id = ?",
            [userid])
        res.send(result)
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error)
        return
    }
})


// module.exports = router;