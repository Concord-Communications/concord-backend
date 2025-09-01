// router for /api/auth
import jwt from 'jsonwebtoken'
import { conn } from '../dbconnecter.js'
import express from 'express'
import Joi from "joi"
import bcrypt from 'bcrypt'
import crypto from "crypto"

const jwt_expiresIn = "7d" // sign jwts for this long
const apikeys = {} // this is mainly for adding users via invite when the no new users thing is on

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

function generateInvite() {
    const id = crypto.randomBytes(16).toString('hex')

    // check for any duplicates
    if (apikeys[id] != undefined || apikeys[id] != null) {
        console.warn("Hit a duplicate API key! Regenerating...")
        return generateApiKey()
    }

    const today = new Date()
    let expire = new Date(today)
    expire.setDate(today.getDate() + 7) // this works. if it aint broke, don't fix it 

    apikeys[id] = { type: "invite", expires: expire } 

    return jwt.sign({
        type: "invite",
        id: id,
    }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

function verifyInvite(id) {
    // see if it exists
    if (apikeys[id] === undefined || apikeys[id] === null) {return false}
    const invite = apikeys[id]

    // check if it expired
    const now = new Date()
    if (invite.expire < now) { delete apikeys[id]; return false}

    // check if it's an invite
    if (invite.type !== "invite") { return false }

    // if it passes, return true
    return true
}

router.post('/admin/invite', async (req, res) => {
    // check if the user is an admin
    if (req.body.global_permissions.admin !== true) {
        return res.status(403).send("Invites require admin!")
    }

    const jwt = generateInvite()
    res.send(jwt)
})



// Log in endpoint
router.post('/', async (req, res) => {
    const { error } = validateLogin(req)
    if (error) {
        res.status(400).send(error.details[0].message)
        return
    }

    try {
        // check if user exists, and if they do, fetch their records to put into the JWT
        let [result] = await conn.execute(
            "SELECT password, id, global_permissions FROM User WHERE handle=? GROUP BY id",
            [req.body.userhandle])
        
        // cleanup the user's channels
        if (result[0] == null) {
            return res.status(404).send("No user with matching handle")
        }

        // check password
        const validpassword = await bcrypt.compare(req.body.password, result[0].password)
        if(!validpassword) {res.status(401).send('Invalid password'); return}

        const token = jwt.sign({
            userID: result[0].id,
            global_permissions: result[0].global_permissions,
            tokenVersion: 0,
        }, process.env.JWT_SECRET, { expiresIn: jwt_expiresIn }) // make the token expire in the amount of time specified in jwt_expiresIn
        res.send(token)

    } catch (error) {
        res.status(500).send("internal server error")
        console.error(error)
        return;
    }
})

// Register endpoint
// this is a hack to make it so the first registration is allowed so admin don't have to 
// do cursed things to create the first (admin) user
let isFirstAuth = true 

router.post('/register', async (req, res) => {
    /*
        isFirstAuth (above) is a feature so that docker users can create their first user (assumed owner) without an invite.
        This is to make it so less tech-savvy users can get started without needing cursed docker configurations.
        This is not a security feature, it is a convenience feature.
    */
    if (isFirstAuth) {
      try {
            // first see if there are more than one user in the database
            // there is always a "system" user from schema.sql
            const [rows] = await conn.execute('SELECT COUNT(*) as count FROM User')
            if (rows[0].count > 1) { // there is one "system" user created at startup
                isFirstAuth = false // if there are users (other than the "system"), then this is not the first auth
                console.log("First auth check returned false")
                console.info("this prevents additional users from being created without an invite")
            } else {
                // if there are no users, we need to assume this is the owner creating an account
                console.warn("First user check returned true! Allowing registration without invite")
                console.info("This is the first user created, we assume this is the owner creating an admin account")

                // don't change isFirstAuth to false, in case there is an issue with the creation
                // this will make it so it has to check one more time.
            }
        } catch (error) {
            console.error(`🧙 You have an error: ${error.message}`)
            return res.status(500).send("Internal server error")
        }

    }

    if (!process.env.creating_users_permitted && !isFirstAuth) { // see above logic for first auth
        // see if the message has an invite, otherwise reject it
        const token = req.headers['x-invite-token']
        if (token === undefined || token === null) {
            return res.status(403).send("This server requires invites")
        }
        // see if it's a valid jwt
        try {
            const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            return res.status(403).send("This server requires invites")
        }
        // see if it's even an invite according to the jwt
        if (decoded.type !== "invite") { return res.status(400).send("token type is not a valid invite") }
        if (!verifyInvite(decoded)) { return res.status(403).send("Invalid invite. Your invite may have expired.") }
    }

    const { error } = validateUser(req.body) 

    if (error) {
        return res.status(400).send(error.details[0].message)
    }

    // see if a user with the same handle already exists
    const errorFound = await findUserFromHandle(req, res)

    if (errorFound) {
        return res.status(409).send("User already exists")
    }
    

    const adminperms = JSON.stringify({admin: true})
    const defaultperms = JSON.stringify({})
    
    // if the user is the first user created we give them admin
    // this makes (in theory) the owner admin
    let result = null
    if (isFirstAuth) {
        try {
            result = await createUser(req, adminperms)
        } catch (error) {
            console.log(`🧙‍♂️ you have an error: ` + error)
        }
        console.warn("Admin user created! This is the first user created, we assume this is the owner creating an admin account. If this isn't the case, please change the permissions manually in the database. userid: " + result)
        
    } else {
        result = await createUser(req, defaultperms)
    }

    if (!result) {
        return res.status(500).send("Internal server error")
    }

    // get the user details and create a JWT if possible
    const details = await findUserByID(result)
    if (!details) {return res.send({id: result, authToken: false})} // if there was an issue getting the details at least return the user id
    const token = jwt.sign({
        userID: result,
        permissions: details[0].permissions,
        channels: details[0].channels,
        tokenVersion: 0,
    }, process.env.JWT_SECRET)
    return res.header('x-auth-token', token).send({id: result, authToken: true}) // sends the JWT in the header as x-auth-token
})

async function findUserByID(id) {
    // this isn't sanitized, don't send it to the client! 
    // it contains credentials
    try {
        let [user] = await conn.execute('SELECT * FROM User WHERE id=?', [id])
        user = {
            ...user
        }
        return user
    } catch (error) {
        return false
    }
}

async function createUser(req, permissions) {

    // hash the password
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)


    try {
        // create a record and return the id
        const [result] = await conn.execute(
            "INSERT INTO User (name, handle, description, password, global_permissions) VALUES (?, ?, ?, ?, ?)",
            [req.body.name, req.body.userhandle, req.body.description, hash, permissions]
        )

        return result.insertId
    } catch (error) {
        console.error(error)
    }

    return false
}