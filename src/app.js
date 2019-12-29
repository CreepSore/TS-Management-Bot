"use: strict";
const fs = require("fs");
const readline = require("readline");

const { TeamSpeak, TextMessageTargetMode } = require("ts3-nodejs-library");
const commandHandler = require(`${__dirname}/commandHandler.js`);
const {formatLocalString} = require(`${__dirname}/localization.js`);

const rl = readline.createInterface(process.stdin, process.stdout);


let init = function () {
    let cfg = getConfig();

    if (!cfg["connection-data"]["password"]) {
        rl.question("Please enter the Query-Password: ", pwd => {
            cfg["connection-data"]["password"] = pwd;
            connect(cfg, run);
        });
    } else {
        connect(cfg, run);
    }
};

/**
 * @param {TeamSpeak} ts
 */
let run = function (ts) {
    setup(ts);

    ts.whoami().then(whoami => {
        console.log(`Connected: ${JSON.stringify(whoami, null, 2)}`);

        Promise.all([
            ts.registerEvent("server"),
            ts.registerEvent("textserver"),
            ts.registerEvent("textchannel"),
            ts.registerEvent("textprivate")
        ]);

        ts.on("clientconnect", ccev => {
            let cfg = getConfig();
            ccev.client.message(formatLocalString("MOTD", {username:ccev.client.nickname}));
            ts.getServerGroupByName("Bot-Controller-User").then(group => {
                if(!ccev.client.servergroups.includes(group.sgid)) {
                    ts.clientAddServerGroup(ccev.client.databaseId, group.sgid);
                    ccev.client.message(formatLocalString("RECEIVED_PERMISSION_USER"));
                }
            }).catch(() => {});
        });

        ts.on("textmessage", msg => {
            commandHandler(msg, ts, whoami);
        });
    });
};

let connect = function (config, callback) {
    TeamSpeak.connect({
        host: config["connection-data"]["host"],
        queryport: config["connection-data"]["queryport"],
        serverport: config["connection-data"]["serverport"],
        username: config["connection-data"]["username"],
        password: config["connection-data"]["password"],
        nickname: config["others"]["nickname"]
    }).then(async ts => {
        ts.on("close", async () => {
            console.log("Connection to Server lost. Reconnecting ...")
            await ts.reconnect(-1, 1000)
            console.log("Reconnected!")
        });
        callback(ts);
    }).catch(ex => {
        console.log(`[Error] => ${ex}`);
    });
};

/**
 * @param {TeamSpeak} ts
 */
let setup = function(ts) {
    ts.getServerGroupByName("Bot-Controller-Admin").then(group => {
        console.log(`Group "${group.name}" already exists.`);
    }).catch(() => {
        ts.serverGroupCreate("Bot-Controller-Admin");
        console.log(`Group "Bot-Controller-Admin" created.`);
    });

    ts.getServerGroupByName("Bot-Controller-User").then(group => {
        console.log(`Group "${group.name}" already exists.`);
    }).catch(() => {
        ts.serverGroupCreate("Bot-Controller-User");
        console.log(`Group "Bot-Controller-User" created.`);
    });
};

let getConfig = function () {
    return JSON.parse(fs.readFileSync(`${__dirname}/config.json`).toString());
};

init();