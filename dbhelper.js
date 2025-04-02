const goose = require('mongoose');
const {bool} = require("joi");

let defaultpermissions = 1

class DBHelper {
    constructor(
        connurl = process.env.MONGO_SERVER_IP || 'mongodb://localhost:27017/termichat',
        ) {
        this.connurl = connurl;
    }

    static userSchema = new goose.Schema({
        name: String,
        handle: {type: String, unique: true},
        email: String,
        password: String,
        description: String,
        permissionids: {type: Number, default: 1},
        channelids: [ Number ],
    })
    static User = goose.model('user', this.userSchema)

    static messagesSchema = new goose.Schema({
        senderid: String,
        message: String,
        channelid: Number,
        date: {type: Date, default: Date.now()},
        reactions: [ String ],
    })
    static Message = goose.model('message', this.messagesSchema)

    async createUser(name, email, password, description) {}
    async createMessage(senderid, message, channelid) {}
    async updateUser(id, newValue) {}
    async updateMessage(id, newValue) {}
    async getMessageInRange(id, range) {
        let reply = this.Message.find({ _id: id, })
            .limit(range)
        return reply
    }
    async getSanitizedUser(id) {
        let reply = this.User.find({ _id: id})
            .select({
                name: 1,
                handle: 1,
                description: 1,
            })
    }
    async connect() {
        try {
            await goose.connect(this.connurl)
                .then(() => console.log('Connected to database:', this.connurl))
        } catch (error) {
            console.log("Fatal: couldn't connect to database")
            console.error(error)
            process.exit(1)
        }
    }
}





async function testing() {
    try {
        await setup()
    } catch (error) {
        console.error(error)
    } finally {
        await goose.disconnect()
            .then(() => console.log("Disconnected from Database"))
    }
}





async function setup() {
    const helper = new DBHelper();
    await helper.connect();
    const message = new DBHelper.Message({
        userid: "000000000",
        message: "Herobrine has joined the game",
        channelid: 1,
        reactions: [],
    })
    const user = new DBHelper.User({
        name: "Herobrine",
        email: "herobrine@example.com",
        password: "fallen_kingdom",
        description: "An example user for testing. if this user posts in your chat please consult documentation."
    })

    try {
        message.id = await user.save().then(() => console.log("saved user"))
        console.log(message.id)
        let messageID = await message.save().then(() => console.log("saved message"))
        console.log(messageID)
    } catch (error) {
        console.log(error)
    }
}



testing()
    .then(() => console.log("finished"))