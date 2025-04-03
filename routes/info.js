// This file is intended to be used for the "/api/info/*" route
const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const conn = require('../dbconnecter')

router.get('/channels/:channel', (req, res) => {
    // send the id of the latest message
    res.status(500).send("service unavailable, no database set up")
})

router.get('/channels', (req, res) => {
    // show all available channels
    res.status(500).send("service unavailable, no database set up")
})

router.get('/users', async (req, res) => {
    // show all users
    //TODO: make an optional choice to limit how many users queried
    res.status(500).send("service unavailable, no database set up")
})




module.exports = router;