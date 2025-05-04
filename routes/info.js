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

router.get('/channels', async (req, res) => {
    // show all available channels
    try {
        const [result] = await conn.execute('SELECT id, name, description FROM channels')
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

router.get('/readtime/me', authenticate, async (req, res) => {
    const userid = req.user.id;
    try {
        const [result] = await conn.execute(
            "SELECT last_read_message FROM User WHERE id = ?",
            [userid]
        )
        res.send(result)
    } catch (e) {
        res.status(500).json("internal server error");
        console.error(error)
        return
    }
})

router.post('/readtime/me/:lastreadid', authenticate, async (req, res) => {
    const userid = req.user.id;
    try {
        const [result] = await conn.execute(
            "UPDATE User SET last_read_message = ? WHERE id = ?",
            [req.params.lastreadid, userid]
        )
        res.send("ok")
    } catch (e) {
        res.status(500).json("internal server error");
        console.error(error)
        return
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