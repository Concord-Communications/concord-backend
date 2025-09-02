// this is the router for "/api/info/*" 
import express from 'express'
import { conn } from '../dbconnecter.js'
import { authenticate } from "../middleware/auth-helper.js";
import Joi from "joi"

export const router = express.Router()


// get the latest message id in a channel
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
            `SELECT * FROM channels`,
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


// get the current user info
router.get('/me', authenticate, async (req, res) => {
    const userid = req.user.userID
    try {
        const [result] = await conn.execute(
            "SELECT id, name, handle, description, created, global_permissions, channels, verified FROM User WHERE id = ?",
            [userid])
        res.send(result)
    } catch (error) {
        res.status(500).send("internal server error");
        console.error(error)
        return
    }
})

router.post('/channels/new', authenticate, async (req, res) => {
    const permissions = req.user.global_permissions
    const validateChannel = (req) => {
        const schema = Joi.object({
            channel_name: Joi.string().required(),
            description: Joi.string().required(),
        })
        const { error, value } = schema.validate(req.body)
        return { error, value }
    }
    const { error } = validateChannel(req)
    if (error) { return res.status(400).send(error.details[0].message) }

    if (permissions.admin !== true) {return res.status(403).send("ur not an admin lil bro")} 
    try {
        const [result] = await conn.query("INSERT INTO channels (name, description) VALUE (?, ?)",
             [req.body.channel_name, req.body.description])
        return res.send("successfully created channel")
    } catch (error) {
        console.error(error)
        return res.status(500).send("internal server error")
    }
})
