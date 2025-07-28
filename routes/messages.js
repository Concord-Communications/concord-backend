// This router is meant for the path "/api/messages/*"

import Joi from "joi"
import express from "express"
import { conn } from "../dbconnecter.js"
import {authenticate} from "../middleware/auth-helper.js"
import socketEvents from "../socketHelper.js";

export const router = express.Router();


router.get("/latest/:channel", authenticate, async (req, res) => {
    const target=parseInt(req.params.channel)
    if (!userChannelPermitted(parseInt(req.params.channel), req.user.channels)) {
        return res.status(403).send("Not authorized.")
    }
    try {
        const [result] = await conn.query('SELECT id FROM Message WHERE channelid=? ORDER BY id DESC LIMIT 1',
            [target])
        res.send(result);
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

router.get('/:channel/:id', authenticate, async (req, res) => {
    // channel and then messages after that specified id
    const channel = parseInt(req.params.channel);
    if (!userChannelPermitted(channel, req.user.channels)) {
        return res.status(403).send("Not authorized.")
    }

    if (req.query.ignore !== 1) {
        const newest_message = parseInt(req.params.id) - 20
        try {
            const [result] = await conn.execute("SELECT lastMessageid FROM UserChannels WHERE userid=? AND channelid=?",
                [req.user.userID, channel])

            if(!(result[0].lastMessageid > newest_message)) {
                await conn.execute(
                    "UPDATE UserChannels SET lastMessageid=? WHERE userid=? AND channelid=?",
                    [newest_message, req.user.userID, channel]
                )
            }

        } catch (e) {
            console.error(e)
            console.warn("ALERT! api/messages/:channel/:id isn't handling read messages for some reason!")
        }
    }

    if (parseInt(req.query.singleOnly) === 1) {
        try {
            const [result] = await conn.execute(
                `SELECT Message.*, User.name, User.handle, User.name_color FROM Message JOIN User ON Message.senderid = User.id
             WHERE Message.id = ? AND Message.channelid = ? ORDER BY Message.id DESC LIMIT 1`,
                [parseInt(req.params.id), channel]
            )
            return res.send(result)
        } catch (error) {
            res.status(500).json("internal server error");
            console.error(error);
        }
    }

    try {
        const [result] = await conn.execute(
            `SELECT Message.*, User.name, User.handle, User.name_color FROM Message JOIN User ON Message.senderid = User.id
             WHERE Message.id <= ? AND Message.channelid = ? ORDER BY Message.id DESC LIMIT 20`,
            [parseInt(req.params.id), channel]
        )
        res.send(result)
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

router.post('/:channel', authenticate, async (req, res) => {
    // request validation
    // needs a name that is less than 18 characters but is more than 0

    if (!userChannelPermitted(req.params.channel, req.user.channels)) {
        return res.status(403).send("Not authorized.")
    }

    const { error } = validateMessage(req.body)
    if (error) {
        res.status(400).send(error.details[0].message)
        return
    }

    let reactions = '[]'
    let channel = parseInt(req.params.channel)
    const senderid = parseInt(req.user.userID)
    try {
        const [result] = await conn.execute(
            'INSERT INTO Message (senderid, content, reactions, channelid, encrypted) VALUES (?, ?, ?, ?, ?)',
            [senderid, req.body.content, reactions, channel, req.body.encrypted])
        res.send({senderid: req.user.userID, message: req.body.content, reactions: reactions});
        socketEvents.emit('message', result.insertId, "create", channel)
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

//TODO: add methods to update and delete messages


function validateMessage(message) {
    const schema = Joi.object({
        content: Joi.string().required(),
        encrypted: Joi.boolean().required(),
    })
    const { error, value } = schema.validate(message)
    return { error, value }
}


function userChannelPermitted(id, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == id) {
            return true
        }
    }
    return false
}

// module.exports = router;