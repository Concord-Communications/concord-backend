// This file is intended to be used for the "/api/info/*" route
import express from 'express'
import { conn } from '../dbconnecter.js'

export const router = express.Router()

router.get('/channels/:channel', (req, res) => {
    // send the id of the latest message
    res.status(500).send("service unavailable, no database set up")
})

router.get('/channels', (req, res) => {
    // show all available channels
    res.status(500).send("service unavailable, no database set up")
})

router.get('/health', async (req, res) => {
    // show all users
    //TODO: make an optional choice to limit how many users queried
    res.status(200).send("Works on my machine.")
})

router.get('/users', async (req, res) => {
    // show all users
    //TODO: make an optional choice to limit how many users queried
    try {
        const [result] = await conn.query('SELECT id, name, handle, description, created, verified FROM User');
        res.send(result)
    }catch (err) {
        res.status(500).json("internal server error");
        console.error(err);
    }

})

// module.exports = router;