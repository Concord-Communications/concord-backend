// This router is meant for the path "/api/messages/*"

import Joi from "joi"
import express from "express"
import { conn } from "../dbconnecter.js"
import {authenticate} from "../middleware/auth-helper.js"

export const router = express.Router();


router.get("/latest/:channel", authenticate, async (req, res) => {
    if (!req.user.channels.contains(req.params.channel)) {
        return res.status(403).send("Not authorized.")
    }
    try {
        const [result] = await conn.query('SELECT id FROM message ORDER BY date DESC LIMIT 1', (err, results) => {
        })
        res.send(result);
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

router.get('/:channel/:id', authenticate, async (req, res) => {
    // channel and then messages after that specified id
    if (!req.user.channels.contains(req.params.channel)) {
        return res.status(403).send("Not authorized.")
    }

    let defaultAmount = 10 || req.query.amount;
    if (req.query.amount > 20) {return res.status(400).send("Maximum amount is 20")}
    const limit = parseInt(req.query.amount) || 10;

    try {
        const [result] = await conn.execute(
            'SELECT * FROM message WHERE id >= ? AND channelid = ? ORDER BY date DESC LIMIT ?',
            [parseInt(req.params.id), parseInt(req.params.channel), limit])
        res.send(result)
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

router.post('/:channel', authenticate, async (req, res) => {
    // request validation
    // needs a name that is less than 18 characters but is more than 0

    if (!req.user.channels.contains(req.params.channel)) {
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
            'INSERT INTO Message (senderid, content, reactions, channelid) VALUES (?, ?, ?, ?)',
            [senderid, req.body.content, reactions, channel])
        res.send({senderid: req.user.userID, message: req.body.content, reactions: reactions});
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

//TODO: add methods to update and delete messages


function validateMessage(message) {
    const schema = Joi.object({
        content: Joi.string().required(),
    })
    const { error, value } = schema.validate(message)
    return { error, value }
}


// module.exports = router;