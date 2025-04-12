// This router is meant for the path "/api/messages/*"

import Joi from "joi"
import express from "express"
import { conn } from "../dbconnecter.js"

export const router = express.Router();


router.get("/latest/:channel", async (req, res) => {
    try {
        const [result] = await conn.query('SELECT id FROM message ORDER BY date DESC LIMIT 1', (err, results) => {
        })
        res.send(result);
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

router.get('/:channel/:id', async (req, res) => {
    // channel and then messages after that specified id
    let defaultAmount = 10 || req.query.amount;
    if (req.query.amount > 20) {return res.status(400).send("Maximum amount is 20")}
    const limit = parseInt(req.query.amount) || 10;

    try {
        const [result] = await conn.query(
            'SELECT * FROM message WHERE id >= ? AND channelid = ? ORDER BY date DESC LIMIT ?',
            [parseInt(req.params.id), parseInt(req.params.channel), limit])
        res.send(result)
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

router.post('/:channel', async (req, res) => {
    // request validation
    // needs a name that is less than 18 characters but is more than 0
    const {error, value} = validateMessage(req.body)
    if (error) {
        res.status(400).send(error.details[0].message)
        return
    }

    let reactions = req.body.reactions.toString() || '[]';

    try {
        const [result] = await conn.query(
            `INSERT INTO Message (senderid, content, reactions, channelid)
             VALUES (?, ?, \'[]\', ?);`,
            [parseInt(req.body.senderid), req.body.content, reactions, parseInt(req.params.channel)])
        res.send(req.body);
    } catch (error) {
        res.status(500).json("internal server error");
        console.error(error);
    }
})

//TODO: add methods to update and delete messages


function validateMessage(message) {
    const schema = Joi.object({
        senderid: Joi.number().required(),
        content: Joi.string().required(),
    })
    return {error, value} = schema.validate(message)
}


// module.exports = router;