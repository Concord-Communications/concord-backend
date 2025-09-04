// This is for core functionality commands
// the more commands, the more bloated this server will be
import { direct_message, clients } from "../socketHelper.js"
import { conn } from "../dbconnecter.js"

const system_bot_id = 1

export async function parse_message(input, userid) {
    let message = input.trim()
    if (message.startsWith("/")) {
        message = message.slice(1) // remove the `/` at the start
        message = message.trim() // remove any whitespace too

        // still say it's a command, but don't run it if the message is too long
        if (message.length > 50) {
            direct_message(clients, userid, system_bot_id, "Command is too long! (limit 50)")
            return true
        } else if (message.length === 0) { // length of 0 after the slash is removed
            direct_message(clients, userid, system_bot_id, "Messages can't start with a slash")
            return true
        }
        parse_command(message, userid) // no need to await
        return true
    }
    return false
}

async function parse_command(message, senderid) {
    let args = message.split(' ')
    if (commands[args[0]] === undefined) {
        return direct_message(clients, senderid, system_bot_id, "unrecognised command")
    }

    commands[args[0]][0](args, senderid)
}

function help(args, senderid) {
    let commandslist = "System Commands:\n"
    for (let key in commands) {
        commandslist += "• " + key + ": " + commands[key][1] + "\n"
    }
    direct_message(clients, senderid, system_bot_id, commandslist)
}

function dice(args, senderid) {
    let reply = ""
    let dice = parseInt(args[1])
    if (Number.isNaN(dice)) {
        return direct_message(clients, senderid, system_bot_id, "thats not a number you troll")
    }
    if (dice > 100 || dice < 2) {
        reply = "you can only roll between 2-100"
    } else {
        reply = "you rolled a " + (Math.floor(Math.random() * dice) + 1) + "! [d" + dice + "]"
    }
    direct_message(clients, senderid, system_bot_id, reply)
}


const commands = {
    help: [help, "prints the help command"],
    roll: [dice, "Roll a dice (2-100)"],
}