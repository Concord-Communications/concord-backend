const Joi = require('joi');
const express = require('express')
const app = express()
app.use(express.json())


const port = process.env.PORT || 8080;

let messages = [
    {id: 1, user: "somenerd", content: "Hello World!" },
    {id: 2, user: "somenerd", content: "erm what the sigma" },
    {id: 3, user: "somenerd", content: "woww" },
    {id: 4, user: "somenerd", content: "thats crazy" },
    {id: 5, user: "somenerd", content: "have you ever had a dream" },
    {id: 6, user: "somenerd", content: "that" },
    {id: 7, user: "somenerd", content: "you" },
    {id: 8, user: "somenerd", content: "umm" },
    {id: 9, user: "you", content: "no"},
]

app.get('/api/', (req, res) => {
    res.send("Hello World")
})

app.get('/api/info/:channel', (req, res) => {
    // send the id of the latest message
    res.send(messages.length.toString())
})

app.get('/api/messages/:channel/:id', (req, res) => {
    let defaultAmount = 10 || req.query.amount;
    if (req.query.amount > 20) {
        res.status(400).send("Maximum amount is 20")
        return;
    }
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

app.post('/api/messages/:channel', (req, res) => {
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

app.put('/api/messages/:channel/:id', (req, res) => {
    // see if exists
    let message = messages.find(m => m.id === parseInt(req.params.id))
    if (!message) {res.status(404).send("err: message not found")}

    // validate request
    const {error} = validateMessage(req.body)
    if (error) {
        res.status(400).send(error.details[0].message)
        return;
    }

    // update message
    message.content = req.body.content
    res.send(message)
})

app.listen(port, () => {
    console.log(`Server started on port ${port}...`)
})





function validateMessage(course) {
    const schema = Joi.object({
        user: Joi.string().min(3).required(),
        content: Joi.string()
    })
    return {error, value} = schema.validate(course)
}
