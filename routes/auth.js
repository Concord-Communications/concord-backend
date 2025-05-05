// intended for /api/auth
import jwt from 'jsonwebtoken'
import { conn } from '../dbconnecter.js'
import express from 'express'
import Joi from "joi"
import bcrypt from 'bcrypt'
// import { string } from "joi"

export const router = express.Router()

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().max(30).required(),
        userhandle: Joi.string().max(50).required(),
        description: Joi.string().required(),
        password: Joi.string().min(8).max(30).required()
    })

    const { error, value } = schema.validate(user)
    return { error, value }
}

function validateLogin(req) {
    const schema = Joi.object({
        userhandle: Joi.string().min(1).max(50).required(),
        password: Joi.string().min(8).max(30).required()
    })
    const {error, value} = schema.validate(req.body)
    return { error, value }
}

async function findUserFromHandle(req) {
    let errorfound = false

    try {
        const [rows] = await conn.execute(
            'SELECT 1 FROM User WHERE handle = ?',
            [req.body.userhandle]
        )

        errorfound = rows.length > 0
    } catch (error) {
        console.error(`🧙 You have an error: ${error.message}`)
        errorfound = true
    }

    return errorfound
}

router.post('/', async (req, res) => {
    // This HAS to be a POST endpoint because react is evil and I made my client in it *sob*
    const { error } = validateLogin(req)
    if (error) {
        res.status(400).send(error.details[0].message)
        return
    }

    try {

        let [result] = await conn.execute(
            "SELECT User.password, User.id, User.permissions, GROUP_CONCAT(UserChannels.channelid) AS channels FROM User LEFT JOIN UserChannels ON User.id=UserChannels.userid WHERE User.handle=? GROUP BY User.id",
            [req.body.userhandle])

        result[0].channels = result[0].channels ? result[0].channels.split(',').map(Number) : [];
        if (result[0] == null) {
            return res.status(404).send("No user with matching handle")
        }
        const validpassword = await bcrypt.compare(req.body.password, result[0].password)
        if(!validpassword) {res.status(401).send('Invalid password'); return}

        if (result[0].channels == null) {result[0].channels = []} // it always should be an array

        const token = jwt.sign({
            userID: result[0].id,
            permissions: result[0].permissions,
            channels: result[0].channels,
            tokenVersion: 0,
        }, process.env.JWT_SECRET)
        res.send(token)

    } catch (error) {
        res.status(500).send("internal server error")
        console.error(error)
        return;
    }
})

router.post('/register', async (req, res) => {
    if (!process.env.creating_users_permitted) {
        res.status(401).send("This server requires invites")
        return
    }

    const { error } = validateUser(req.body)

    if (error) {
        return res.status(400).send(error.details[0].message)
    }

    const errorFound = await findUserFromHandle(req, res)

    if (errorFound) {
        return res.status(409).send("User already exists")
    }

    const result = await createUser(req, res)
    if (!result) {
        return res.status(500).send("Internal server error")
    }
    // otherwise
    const details = await findUserByID(result)
    if (!details) {return res.send({id: result, authToken: false})}
    const token = jwt.sign({
        userID: result,
        permissions: details[0].permissions,
        channels: details[0].channels,
        tokenVersion: 0,
    }, process.env.JWT_SECRET)
    return res.header('x-auth-token', token).send({id: result, authToken: true})
})

async function findUserByID(id) {
    // THIS FUNCTION IS NOT SANITIZED
    try {
        let [user] = await conn.execute('SELECT * FROM User WHERE id=?', [id])
        const [channels] = await conn.execute('SELECT channelid FROM UserChannels WHERE userid = ?', [id])
        user = {
            ...user,
            channels: channels,
        }
        return user
    } catch (error) {
        return false
    }
}

async function createUser(req) {

    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)


    try {
        const [result] = await conn.execute(
            "INSERT INTO User (name, handle, description, password, permissions) VALUES (?, ?, ?, ?, 0)",
            [req.body.name, req.body.userhandle, req.body.description, hash]
        )

        return result.insertId
    } catch (error) {
        console.error(error)
    }

    return false
}