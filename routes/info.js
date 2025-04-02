// This file is intended to be used for the "/api/info/*" route

const express = require('express')
const router = express.Router()

router.get('/:channel', (req, res) => {
    // send the id of the latest message
    res.status(500).send("service unavailable, no database set up")
})

router.get('/channels', (req, res) => {
    // show all available channels
    res.status(500).send("service unavailable, no database set up")
})

router.get('/users', (req, res) => {
    // show all users
    res.status(500).send("service unavailable, no database set up")
})

module.exports = router;