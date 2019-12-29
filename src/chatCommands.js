const { TextMessageTargetMode, TeamSpeakClient, TeamSpeak, Codec } = require("ts3-nodejs-library");

const {formatLocalString} = require(`${__dirname}/localization.js`);

/**
 * @description Displays help to the Client
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 * @param { TeamSpeak } ts
 * @param { string } command
 * @param { Array } args
 */
let help = function(msg, ts, command, args) {
    msg.invoker.message(formatLocalString("COMMAND.HELP.TEXT", {username: msg.invoker.nickname}));
}

/**
 * @description UwU-OwO Funfunc
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 * @param { TeamSpeak } ts
 * @param { string } command
 * @param { Array } args
 */
let uwuowo = function(msg, ts, command, args) {
    if(command.toLowerCase() === "uwu") {
        msg.invoker.message("owo");
    } else if(command.toLowerCase() === "owo") {
        msg.invoker.message("uwu");
    }
}

/**
 * @description Creates a Temporary channel for a Client
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 * @param { TeamSpeak } ts
 * @param { string } command
 * @param { Array } args
 */
let createChannel = function(msg, ts, command, args) {
    if(args.length < 1) {
        msg.invoker.message(formatLocalString("COMMAND.CREATECHANNEL.TOOFEWARGS", null, "de"));
        return;
    }

    ts.whoami().then(whoami => {
        ts.channelList({
            channel_name: args[0]
        }).then(channels => {
            if(channels.length > 0) {
                msg.invoker.message(formatLocalString("COMMAND.CREATECHANNEL.CHANNELEXISTS", null));
                return;
            }

            let pwd = "";
            for(let i = 1; i < args.length; i++) {
                pwd += `${args[i]} `;
            }
            pwd = pwd.trim();

            ts.channelCreate(args[0], {
                channel_flag_temporary: 1,
                channel_password: pwd,
                channel_codec: 5,
                channel_codec_quality: 10,
                channel_description: formatLocalString("COMMAND.CREATECHANNEL.CHANNELDESC", {
                    bot_nickname: whoami.client_nickname,
                    client_nickname: msg.invoker.nickname,
                    client_id: msg.invoker.clid
                })
            }).then(channel => {
                msg.invoker.move(channel.cid, pwd ? pwd : null);
                ts.setClientChannelGroup(5, channel.cid, msg.invoker.databaseId);
                ts.getClientByID(whoami.client_id).then(client => {
                    client.kickFromChannel("");
                });

                msg.invoker.message(formatLocalString("COMMAND.CREATECHANNEL.CHANNELCREATED", {
                    username: msg.invoker.nickname,
                    client_id: msg.invoker.clid,
                    channel_name: args[0],
                    channel_password: pwd,
                    channel_id: channel.cid
                }));
            });
        });
    });
}

/**
 * @description Toggles ServerAdmin
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 * @param { TeamSpeak } ts
 * @param { string } command
 * @param { Array } args
 */
let toggleServerAdmin = function(msg, ts, command, args) {
    if(msg.invoker.servergroups.includes(6)) {
        msg.invoker.delGroups(6);
        msg.invoker.poke(formatLocalString("COMMAND.TOGGLESERVERADMIN.REMOVED"));
    } else {
        msg.invoker.addGroups(6);
        msg.invoker.poke(formatLocalString("COMMAND.TOGGLESERVERADMIN.ADDED"));
    }
}

/**
 * @description Pokespams a user
 * @param { {invoker : TeamSpeakClient, msg : string, targetmode : TextMessageTargetMode} } msg
 * @param { TeamSpeak } ts
 * @param { string } command
 * @param { Array } args
 */
let pokespam = function(msg, ts, command, args) {
    if(args.length < 2) {
        return;
    }

    ts.getClientByName(args[0]).then(client => {
        for(let i = 0; i < args[1]; i++) {
            client.poke("Nibba");
        }
    }).catch(() => {

    });
}

module.exports = {
    help,
    uwuowo,
    createChannel,
    toggleServerAdmin,
    pokespam
};