// This router is meant for the path "/api/messages/*"

const Joi = require("joi");
const express = require("express");
const router = express.Router();

let messages = [
    {id: 1, user: "system", content: "-- Channel Start --" },
]

router.get('/:channel/:id', (req, res) => {
    let defaultAmount = 10 || req.query.amount;
    if (req.query.amount > 20) {return res.status(400).send("Maximum amount is 20")}
    //TODO:
    switch (req.query.loadmethod) {
        case 'around':
            // messages around the id
            break;
        case 'ahead':
            // messages ahead of the id
            break;
        case 'behind':
            // messages behind the id
            break;
        default:
            // messages ahead of the id
            break;
    }
    let response_message = messages.find(m => m.id === parseInt(req.params.id))
    if (!response_message) {res.status(404).send("err: message not found")}
    res.send(response_message)
})

router.post('/:channel', (req, res) => {
    // request validation
    // needs a name that is less than 18 characters but is more than 0
    const {error} = validateMessage(req.body)
    if (error) {
        res.status(400).send(error.details[0].message)
        return
    }
    messages.push(value)
    res.send(value)
})

router.put('/:channel/:id', (req, res) => {
    // see if exists
    let message = messages.find(m => m.id === parseInt(req.params.id))
    if (!message) { return res.status(404).send("err: message not found")}

    // validate request
    const {error} = validateMessage(req.body)
    if (error) {return res.status(400).send(error.details[0].message)}

    // update message
    message.content = req.body.content
    res.send(message)
})

router.delete('/:channel/:id', (req, res) => {
    // search to see if exists
    let message = messages.find(m => m.id === parseInt(req.params.id))
    if (!message) { return res.status(404).send("error: message not found")}

    // delete message
    const messageToRemove = messages.indexOf(message)
    messages.splice(messageToRemove, 1)
    res.send(message)
})

function validateMessage(course) {
    const schema = Joi.object({
        user: Joi.string().min(3).required(),
        content: Joi.string()
    })
    return {error, value} = schema.validate(course)
}

module.exports = router;