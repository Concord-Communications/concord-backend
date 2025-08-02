// This is for core functionality commands
// the more commands, the more bloated this server will be
import { direct_message, clients } from "../socketHelper"
import { conn } from "../dbconnecter"

commands = {
    help: help,
    ban: ban,
    unban: unban,
    dm: direct_message,
    msg: direct_message,
    on: get_online_users,
    online: get_online_users,
}


async function parse_messages(req, res) {
    const message = req.body.content.trim()
    
    if (!message.startsWith('/')) {return false} // not a command
    const args = message.slice(1).split(' ')
    // see if the command exists
    if (!(args[0] in commands)) {
        // don't send an error because bots might have a command registered under the same name
        return true // not a valid command, but might be someone trying to use a command
    }

    commands[args[0]](req, res, args)

    return true
}


function help(req, res, args) {
    direct_message(clients, req.user.userID, 1, 
        "TODO: add the help message here, this is a placeholder for now"
    )
}
function ban(req, res, args) {
    direct_message(clients, req.user.userID, 1, "Ban command is not implemented yet. Remove them from the DB, change the JWT password, and restart if you are extremely desperate.")
}


function unban(req, res, args) {
    direct_message(clients, req.user.userID, 1, "Unban command is not implemented yet, neither should the ban command be. If you somehow banned someone... good luck.")
}

function direct_message(req, res, args) {
    // direct message should not be saved to the database because if one person spams it won't be detected until it's too late
    try {
        const [result] = conn.query("SELECT id FROM User WHERE handle = ?", [args[1]]) 
        direct_message(clients, result[0].id, req.user.userID, args.slice(2).join(" "))
    } catch (error) {
        direct_message(clients, req.user.userID, 1, "Error finding user")
        return
    }
}
function get_online_users(req, res, args) {
    direct_message(clients, req.user.userID, 1, "online users is not implemented yet.")
    // get the names of users online (sockets)
}
