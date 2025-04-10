// intended for /api/auth

import { conn } from '../dbconnecter.js'
import express from 'express'
import Joi from "joi"
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

    return result ? res.status(200).send("User created successfully")
                  : res.status(500).send("Error creating user")
})


async function createUser(req) {
    try {
        const [result] = await conn.execute(
            "INSERT INTO User (name, handle, description, password, permissions, channels) VALUES (?, ?, ?, ?, 0, '[]')",
            [req.body.name, req.body.userhandle, req.body.description, req.body.password]
        )

        return true
    } catch (error) {
        console.error(error)
    }

    return false
}