// intended for /api/auth

const conn = require('../dbconnecter')
const express = require('express')
const Joi = require("joi");
const {string} = require("joi");
const router = express.Router()

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().max(30).required(),
        userhandle: Joi.string().max(50).required(),
        description: Joi.string().required(),
        password: Joi.string().min(8).max(30).required()
    })
    return {error, value} = schema.validate(user)
}

async function findUserFromHandle(req, res) {
    let errorfound = false;
    conn.query(
        'SELECT 1 FROM User WHERE handle = ?',
        [req.body.userhandle],
        (error, result) => {
            if (error) {console.error(error); errorfound = true; return errorfound}
            console.log("result0:", result.length)
            if (result.length > 0) {
                res.status(409).send("User already exists");
                errorfound = true;
                return errorfound;
            }
        })
    return errorfound;
}

async function createUser(req, res) {
    let errorfound = false;
    conn.query(
        "INSERT INTO User (name, handle, description, password, permissions, channels) VALUES (?, ?, ?, ?, 0, '[]');",
        [req.body.name, req.body.userhandle, req.body.description, req.body.password],
        (error, result) => {
            if (error) {console.error(error); res.status(500).send("Internal server error"); errorfound = true; return;}
            res.send({id: result.insertId}); // client is expected to query "/api/info/user"
            return;
        })
    console.log("still running")
    return errorfound;
}

router.post('/register', async (req, res) => {
    if (!process.env.creating_users_permitted) {res.status(401).send("This server requires invites"); return;}
    const {error, value} = validateUser(req.body)
    if (error) { res.status(400).send(error.details[0].message); return }

    await findUserFromHandle(req, res).then((result) => {
        console.log(result)
        if (result) { return }
    })

    await createUser(req, res).then((result) => {
        console.log(result)
        if (result) { return }
    })
})


module.exports = router;