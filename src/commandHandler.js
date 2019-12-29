const { TextMessageTargetMode, TeamSpeakClient, TeamSpeak } = require("ts3-nodejs-library");
const commands = require(`${__dirname}/chatCommands.js`);
const { formatLocalString } = require(`${__dirname}/localization.js`);

/**
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 * @param { TeamSpeak } ts
 */
let handleMessage = function(msg, ts, whoami) {
    if(msg.invoker.clid === whoami.client_id) {
        return;
    }

    ts.getServerGroupByName("Bot-Controller-User").then(group => {
        if(!msg.invoker.servergroups.includes(group.sgid)) {
            msg.invoker.message(formatLocalString("INVALID_PERMISSION_USER"));
            return;
        }

        let splitted = msg.msg.split(" ");
        let command = splitted[0];
        splitted.splice(0,1);
        let args = splitted;

        console.log(`Handling Command [name:"${msg.invoker.nickname}";msg="${msg.msg}"]`);

        switch(msg.targetmode) {
            case(TextMessageTargetMode.CLIENT): {
                handlePrivateMessage(msg, ts, command, args, "user");
                break;
            }

            case(TextMessageTargetMode.CHANNEL): {
                handleChannelMessage(msg, ts, command, args, "user");
                break;
            }

            case(TextMessageTargetMode.SERVER): {
                handleServerMessage(msg, ts, command, args, "user");
                break;
            }
        }
    });

    ts.getServerGroupByName("Bot-Controller-Admin").then(group => {
        if(!msg.invoker.servergroups.includes(group.sgid)) {
            return;
        }

        let splitted = msg.msg.split(" ");
        let command = splitted[0];
        splitted.splice(0,1);
        let args = splitted;

        console.log(`Handling Command [name:"${msg.invoker.nickname}";msg="${msg.msg}"]`);

        switch(msg.targetmode) {
            case(TextMessageTargetMode.CLIENT): {
                handlePrivateMessage(msg, ts, command, args, "admin");
                break;
            }

            case(TextMessageTargetMode.CHANNEL): {
                handleChannelMessage(msg, ts, command, args, "admin");
                break;
            }

            case(TextMessageTargetMode.SERVER): {
                handleServerMessage(msg, ts, command, args, "admin");
                break;
            }
        }
    });
};

/**
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 */
let handleServerMessage = function(msg, ts, command, args, mode) {
    let func = serverCommands[mode][command.toLowerCase()];
    if(func) func(msg, ts, command, args);
};

/**
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 */
let handlePrivateMessage = function(msg, ts, command, args, mode) {
    let func = privateCommands[mode][command.toLowerCase()];
    if(func) func(msg, ts, command, args);
};

/**
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 */
let handleChannelMessage = function(msg, ts, command, args, mode) {
    let func = channelCommands[mode][command.toLowerCase()];
    if(func) func(msg, ts, command, args);
};


let serverCommands = {
    "user": {

    },
    "admin": {

    }
}

let privateCommands = {
    "user": {
        help: commands.help,
        uwu: commands.uwuowo,
        owo: commands.uwuowo,
        createchannel: commands.createChannel
    },
    "admin": {
        toggleserveradmin: commands.toggleServerAdmin,
        pokespam: commands.pokespam
    }
}

let channelCommands = {
    "user": {

    },
    "admin": {

    }
}


module.exports = handleMessage;