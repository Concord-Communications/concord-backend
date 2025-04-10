// This router is meant for the path "/api/messages/*"

import Joi from "joi"
import express from "express"
import { conn } from "../dbconnecter.js"

export const router = express.Router();


router.get("/latest/:channel", async (req, res) => {
    conn.query('SELECT id FROM message ORDER BY date DESC LIMIT 1', (err, results) => {
        if (err) {res.status(500).json("internal server error"); console.error(err); return;}
        res.send(results);
    })
})

router.get('/:channel/:id', async (req, res) => {
    // channel and then messages after that specified id
    let defaultAmount = 10 || req.query.amount;
    if (req.query.amount > 20) {return res.status(400).send("Maximum amount is 20")}
    const limit = parseInt(req.query.amount) || 10;

    conn.query(
        'SELECT * FROM message WHERE id >= ? AND channelid = ? ORDER BY date DESC LIMIT ?',
        [parseInt(req.params.id), parseInt(req.params.channel), limit],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json("internal server error");
                return;
            }
        // yay callbacks
        res.send(result)
    })
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

    conn.query(
        `INSERT INTO Message (senderid, content, reactions, channelid) VALUES (?, ?, \'[]\', ?);`,
        [parseInt(req.body.senderid), req.body.content, reactions, parseInt(req.params.channel)],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json("internal server error");
                return;
            }
            res.send(req.body);
        }
    )
})

router.put('/:channel/:id', async (req, res) => {
    // update message
    // see if exists
    if (!seeIfExistsMessage(req.params.id, req.params.channel)) {return res.status(404).send("resource not found");}

    // validate request
    const {error} = validateMessage(req.body)
    if (error) {return res.status(400).send(error.details[0].message)}

    // update message
    conn.query(
        'UPDATE message SET content = ? WHERE id = ? AND channelid = ? LIMIT 1;',
        [req.body.content, req.params.id, req.params.channel],
        (error, result) => {
            if (error) {console.error(error); res.status(500).json("internal server error"); return;}
            conn.query(
                'SELECT * FROM message WHERE id = ? AND channelid = ? LIMIT 1;',
                [req.params.id, req.params.channel],
                (err2, result2) => {
                    if (error) {console.error(error); res.status(500).json("internal server error"); return;}
                    res.send(result2);
                }
            )
        })
})

router.delete('/:channel/:id', (req, res) => {
    // search to see if exists
    if (!seeIfExistsMessage(req.params.id, req.params.channel)) {return res.status(404).send("resource not found");}

    // delete message
    conn.query(
        'UPDATE message SET content = "Message Deleted", senderid = 0 WHERE id = ? AND channelid = ? LIMIT 1;',
        // sender id 0 for system announcements
        [req.params.id, req.params.channel],
        (error, result) => {
            if (error) {console.error(error); res.status(500).json("internal server error"); return;}
            conn.query(
                'SELECT * FROM message WHERE id = ? AND channelid = ? LIMIT 1;',
                [req.params.id, req.params.channel],
                (err2, result2) => {
                    if (error) {console.error(error); res.status(500).json("internal server error"); return;}
                    res.send(result2);
                }
            )
        })

})

function validateMessage(message) {
    const schema = Joi.object({
        senderid: Joi.number().required(),
        content: Joi.string().required(),
    })
    return {error, value} = schema.validate(message)
}


function seeIfExistsMessage(id, channel) {
    conn.query(
        'SELECT 1 FROM message WHERE id = ? AND channelid = ? LIMIT 1;',
        [parseInt(req.params.id), parseInt(req.params.channel)],
        (err, result) => {
            if (err) {res.status(500).json("internal server error"); console.error(err); return;}


            if (result[0]["1"] != 1) {
                return true
            }
        }
    )
    return false;
}

// module.exports = router;