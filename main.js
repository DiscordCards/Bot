/* Copyright (c) Snazzah/SnazzyPine25 <suggesttosnazzy@gmail.com> */

/* Require modules */
const Discord = require('discord.js');
const fs = require('fs');
const Config = require(__dirname+'/config.json');
const Common = require(__dirname+'/util/Common.js');
const Extends = require(__dirname+'/util/Extends.js');
const rethink = require('rethinkdb');
const chalk = require('chalk');
const Jimp = require('jimp');
const request = require('superagent');
let cacheManager = require('cache-manager');
let redisStore = require('cache-manager-redis');

global.request = request;
global.Common = Common;

let DiscordCards = new Discord.Client({
	autoReconnect: true,
	disableEveryone: true,
	shardCount: Config.shards,
	shardId: parseInt(process.argv[2]),
	maxCachedMessages: 250,
	bot: true,
	userAgent: {
		url: 'http://discord.cards',
		version: Config.version
	},
	disabledEvents: ["TYPING_START", "TYPING_STOP"]
});
let Cache = cacheManager.caching({store: redisStore, db: 0, ttl: 3600});

DiscordCards.commandHandler = new (require(__dirname+'/util/CommandHandler.js'))(__dirname+"/commands");
DiscordCards.classHandler = new (require(__dirname+'/util/ClassHandler.js'))(__dirname+"/classes");
DiscordCards.locale = new (require(__dirname+'/util/LocaleHandler.js'))(__dirname+"/locale");
DiscordCards.Logger = new (require(__dirname+'/util/Logger.js'))(__dirname+"/logs");
DiscordCards.Extends = Extends;
DiscordCards.Lockdown = false;
let Quotes = [
	"Woah hold on, lemme process this!",
	"429: Rate limited.",
	"You need to cooldown!",
	"You're too tired to do that, ${NAME}.",
	":thinking:"
]
let awaitedMessages = {};
let pageProcesses = {};
let cooldowns = {};

DiscordCards.awaitMessage = function(msg, callback, timeout = 30000) {
	return new Promise((resolve, reject) => {
		if (!awaitedMessages[msg.channel.id]) awaitedMessages[msg.channel.id] = {};
		let timer;
		if (timeout >= 0) {
			timer = setTimeout(function() {
				delete awaitedMessages[msg.channel.id][msg.author.id];
				reject(new Error(`Request timed out (${timeout}ms)`));
			}, timeout);
		}
		if (awaitedMessages[msg.channel.id][msg.author.id]) {
			awaitedMessages[msg.channel.id][msg.author.id].reject();   
		}
		awaitedMessages[msg.channel.id][msg.author.id] = {
			resolve: function(msg2) { clearTimeout(timer); resolve(msg2); },
			reject: function() { clearTimeout(timer); reject(new Error('Request was overwritten')); },
			callback
		};
	});
}

DiscordCards.startPagination = function(_, msg, botmsg, cb, timeout = 10000) {
	botmsg.react("◀").then(()=>{
		botmsg.react("🛑").then(()=>{
			botmsg.react("▶").then(()=>{
				if (!pageProcesses[msg.channel.id]) pageProcesses[msg.channel.id] = {};
				let timer;
				if (timeout >= 0) {
					timer = setTimeout(function() {
						delete pageProcesses[msg.channel.id][msg.author.id];
						cb(new Error(`Request timed out (${timeout}ms)`), null, (nd)=>DiscordCards.quitPagination(_, msg, botmsg, nd));
					}, timeout);
				}
				if (pageProcesses[msg.channel.id][msg.author.id]) {
					pageProcesses[msg.channel.id][msg.author.id].reject();   
				}
				pageProcesses[msg.channel.id][msg.author.id] = {
					resolve: function(reaction) {
						clearTimeout(timer);
						timer = setTimeout(function() {
							delete pageProcesses[msg.channel.id][msg.author.id];
							cb(new Error(`Request timed out (${timeout}ms)`), null, (nd)=>DiscordCards.quitPagination(_, msg, botmsg, nd));
						}, timeout);
						cb(null, reaction, (nd)=>DiscordCards.quitPagination(_, msg, botmsg, nd));
					},
					reject: function() { clearTimeout(timer); cb(_('paginate_error_overwritten'), null, (nd)=>DiscordCards.quitPagination(_, msg, botmsg, nd)); },
					stop: function() { clearTimeout(timer); },
					id: botmsg.id
				};
			}).catch(()=>{cb(_('paginate_error_cant_react'), null, (nd)=>DiscordCards.quitPagination(_, msg, botmsg, nd))});
		}).catch(()=>{cb(_('paginate_error_cant_react'), null, (nd)=>DiscordCards.quitPagination(_, msg, botmsg, nd))});
	}).catch(()=>{cb(_('paginate_error_cant_react'), null, (nd)=>DiscordCards.quitPagination(_, msg, botmsg, nd))});
}

DiscordCards.quitPagination = function(_, msg, botmsg, nodel){
	return new Promise((resolve, reject) => {
		botmsg.clearReactions().then(()=>{
			if(!nodel) delete pageProcesses[msg.channel.id][msg.author.id];
			resolve();
		}).catch(()=>{
			if(!nodel) delete pageProcesses[msg.channel.id][msg.author.id];
			reject(_('paginate_error_cant_clear'));
		})
	})
}

//DiscordCards.rawShard = ShardManager.shards.get(DiscordCards.shard.id)

rethink.connect({host: Config.r.url, port: Config.r.port, user: Config.r.user, password: Config.r.password}, (err, conn) => {
	console.log("[SHARD "+DiscordCards.shard.id+"] Connected to rethink");
	if(err){ throw err; }
	conn.use(Config.r.db);
	global.rdb = {r: rethink, conn: conn};
	DiscordCards.commandHandler.load().then(() => {
		global.Cache = Cache;
		DiscordCards.classHandler.load().then(classes => {
			DiscordCards.locale.load().then(() => {
				console.log("[SHARD "+DiscordCards.shard.id+"] Commands loaded");
				DiscordCards.classHandler.classes.StaticData.getRatelimitQuotes().then(quotes => {
					Quotes = quotes;
					DiscordCards.login(Config.token).then(() => {
						console.log("[SHARD "+DiscordCards.shard.id+"] Logged in");
						DiscordCards.classes = classes;
						DiscordCards.Config = Config;
						DiscordCards.IP = new (require(__dirname+'/util/ImageProcess.js'))(DiscordCards.shard.id, Config.debug);
						global.DiscordCards = DiscordCards;
						Common.sendStatus('launch');
						if(Config.debug) return;
						DiscordCards.shard.fetchClientValues('guilds.size').then((servers) => {
							console.log("[SHARD "+DiscordCards.shard.id+"] Updated server count");
							Common.updateServers(servers.reduce((prev, val) => prev + val, 0));
							if(!Config.debug && (DiscordCards.shard.id === 0 || DiscordCards.shard.id === "0")){
								setInterval(() => {
									if(DiscordCards.Lockdown) return;
									DiscordCards.shard.fetchClientValues('guilds.size').then((servers) => {
										console.log("[SHARD "+DiscordCards.shard.id+"] Updated server count");
										Common.updateServers(servers.reduce((prev, val) => prev + val, 0));
									});
									cooldowns = {};
								}, 600000)
							}
						});
					}).catch((e) => {throw e;});
				}).catch((e) => {throw e;});
			}).catch((e) => {throw e;});
		}).catch((e) => {throw e;});
	}).catch((e) => {throw e;});
})

DiscordCards.on('error', (error) => {
	console.log("[SHARD "+DiscordCards.shard.id+"] ERROR", error);
});

DiscordCards.on("warn", (str) => {
	console.log("[SHARD "+DiscordCards.shard.id+"] WARN", str);
});

DiscordCards.on("disconnected", function(){
	console.log("[SHARD "+DiscordCards.shard.id+"] DISCONNECTED");
	Common.sendStatus('disconnect');
});

DiscordCards.on('reconnecting', () => {
	console.log("[SHARD "+DiscordCards.shard.id+"] Reconnecting to discord servers...");
	Common.sendStatus('reconnect');
});

DiscordCards.on('resume', (replays) => {
	console.log("[SHARD "+DiscordCards.shard.id+"] Resumed connection. Replayed "+replays+" events.");
	Common.sendStatus('resume', "Replayed "+replays+" events.");
});

DiscordCards.once("ready", function(){
	if(DiscordCards.user !== null){
		DiscordCards.classHandler.classes.StaticData.getGameStatus().then(status => {
			DiscordCards.user.setActivity(status.replace("${PREFIX}", Config.prefix.default).replace("${VER}", Config.version));
		}).catch(e=>{DiscordCards.user.setGame(Config.prefix.default+"help");})
	}
});

DiscordCards.on("messageReactionAdd", (react, user)=>{
	if(DiscordCards.user.id !== user.id){
		if (pageProcesses.hasOwnProperty(react.message.channel.id) && pageProcesses[react.message.channel.id].hasOwnProperty(user.id) && pageProcesses[react.message.channel.id][user.id].id === react.message.id) {
			pageProcesses[react.message.channel.id][user.id].resolve(react);
		}
	}
});

DiscordCards.on("messageDelete", (message)=>{
	if (pageProcesses.hasOwnProperty(message.channel.id)) {
		Object.keyValueForEach(pageProcesses[message.channel.id], (k,v)=>{
			if(v.id === message.id) v.stop();
		});
	}
});
/*
ShardManager.on("message", (shard, message) => {
	if(DiscordCards.shard.id === message.to){
		switch(message.type){
			case "ping":
				shard.send({to: shard.id, type: "rping"})
				break;
		}
	}
});
*/

DiscordCards.on('message', (Message) => {
	if(Message.author.bot) return;
	if(Message.channel.type !== "dm" && !Message.channel.permissionsFor(DiscordCards.user).has("SEND_MESSAGES")) return;
	try{
		let Server = new DiscordCards.classHandler.classes.Server(Message.guild ? Message.guild.id : "dm");
		Server.getElseCreate(Message.channel.type === "dm").then(serverdata=>{
			let prefix = serverdata.prefix || Config.prefix.default;
			let _ = DiscordCards.locale.createModule(serverdata.locale || "en-US", prefix);
			let Args = Message.content.replace(/\s\s+/g, " ").split(" ");
			let prefixType = -1; // -1, None, 0: Standard, 1: Username, 2: Mention
			let command = "";

			if(Args[0].startsWith(prefix)){
				prefixType = 0;
				command = Args[0].replace(prefix, "").toLowerCase();
			}else if(Args[0].toLowerCase() === DiscordCards.user.username.toLowerCase()){
				prefixType = 1;
				Args.shift();
			}else if(Message.isMentioned(DiscordCards.user)){
				prefixType = 2;
				Args.shift();
			}
			
			if(prefixType >= 1){
				if(Args[0] === "" || Args[0] === undefined || Args[0] === null) return;
				command = Args[0].toLowerCase();
			}

			if(prefixType >= 0){
				Args.shift();
				if(command === "eval"){
					if(Message.author.id === DiscordCards.Config.owner || DiscordCards.Config.devs.includes(Message.author.id)){
						try{
							let start = new Date().getTime();
							let msg = "";
							if(Args[0] === "-c"){
								let code = Args.splice(1, Args.length).join(" ");
								msg += "```js\n"+code+"```\n";
								msg += "```js\n"+eval(code)+"```";
							}else{
								let code = Args.join(" ");
								msg += "```js\n"+eval(code)+"```";
							}

							let end = new Date().getTime();
							let time = end - start;

							Message.channel.send("Time taken: "+(time/1000)+" seconds\n"+msg);
						}catch(e){
							Message.channel.send("```js\n"+e+"```");
						}
					}
					return;
				}

				let User = new DiscordCards.classHandler.classes.User(Message.author);
				User.updateInfo();
				let cmd = DiscordCards.commandHandler.search(command);
				command = cmd.RootName;
				if(cmd != undefined && !DiscordCards.Lockdown){
					User.ensure().then(user => {
						User.get().then(ou=>{
							if(ou&&ou.settings.locale){
								_ = DiscordCards.locale.createModule(ou.settings.locale || serverdata.locale || "en-US", prefix);
							};
							if(ou&&ou.banned){
								Message.reply(_('error', { code: new Date().valueOf().toString(36) }));
								return;
							};
							let cooldown = 0;
							if(!cooldowns[Message.author.id]){cooldowns[Message.author.id] = {}};
							if(cooldowns[Message.author.id][command] != undefined){
								cooldown = cooldowns[Message.author.id][command];
							}
							if((Date.now() - cooldown) > (cmd.Cooldown*1000) || Message.author.id === DiscordCards.Config.owner){
								if(user[command] != undefined){
									cooldown = user[command];
								}
								if((Date.now() - cooldown) > (cmd.Cooldown*1000) || Message.author.id === DiscordCards.Config.owner){
									if(Message.author.id != DiscordCards.Config.owner){
										User.setCooldown(command).then(()=>{
											try{
												DiscordCards.Logger.log(`[SHARD ${DiscordCards.shard.id}] ${new Date()} User ${Message.author.username} (${Message.author.id}) executed command \`${Message.content}\` in ${Message.channel.type !== "dm" ? `channel ${Message.channel.name} (${Message.channel.id}) in guild ${Message.guild.name} (${Message.guild.id})` : "DMs"}`);
												cooldowns[Message.author.id][command] = Date.now();
												cmd.Execute(Args, Message, _, serverdata);
											} catch (e) {
												Common.sendError(Message, e);
											}
										});
									}else{
										try{
											DiscordCards.Logger.log(`[SHARD ${DiscordCards.shard.id}] ${new Date()} User ${Message.author.username} (${Message.author.id}) executed command \`${Message.content}\` in ${Message.channel.type !== "dm" ? `channel ${Message.channel.name} (${Message.channel.id}) in guild ${Message.guild.name} (${Message.guild.id})` : "DMs"}`);
											cooldowns[Message.author.id][command] = Date.now();
											cmd.Execute(Args, Message, _, serverdata);
										} catch (e) {
											Common.sendError(Message, e);
										}
									}
								}else{
									DiscordCards.Logger.log(`[SHARD ${DiscordCards.shard.id}] ${new Date()} User ${Message.author.username} (${Message.author.id}) executed command \`${Message.content}\` in ${Message.channel.type !== "dm" ? `channel ${Message.channel.name} (${Message.channel.id}) in guild ${Message.guild.name} (${Message.guild.id})` : "DMs"} (Blocked by memory cooldown: ${cmd.Cooldown - (Date.now() - cooldown) / 1000})`);
									let timeLeft = Math.round(cmd.Cooldown - (Date.now() - cooldown) / 1000);
									Message.channel.send(`${Array.random(Quotes).replace("${NAME}", Message.author.username)} *(${timeLeft} second${timeLeft === 1 ? "" : "s"})*`)
								}
							}else{
								DiscordCards.Logger.log(`[SHARD ${DiscordCards.shard.id}] ${new Date()} User ${Message.author.username} (${Message.author.id}) executed command \`${Message.content}\` in ${Message.channel.type !== "dm" ? `channel ${Message.channel.name} (${Message.channel.id}) in guild ${Message.guild.name} (${Message.guild.id})` : "DMs"} (Blocked by rethink cooldown: ${cmd.Cooldown - (Date.now() - cooldown) / 1000})`);
								let timeLeft = Math.round(cmd.Cooldown - (Date.now() - cooldown) / 1000);
								Message.channel.send(`${Array.random(Quotes).replace("${NAME}", Message.author.username)} *(${timeLeft} second${timeLeft === 1 ? "" : "s"})*`)
							}
						}).catch(e => {Common.checkRDBConn(Message, e)});
					}).catch(e => {Common.checkRDBConn(Message, e)});
				}
			}
		}).catch(e=>{
			if(e.stack.match(/Connection\sis\sclosed/) && !DiscordCards.Lockdown) Common.checkRDBConn(message, e);
		});
	}catch(e){
		console.log("[SHARD "+DiscordCards.shard.id+"] MESSAGE HANDLING ERROR", e);
	}

	if (awaitedMessages.hasOwnProperty(Message.channel.id) && awaitedMessages[Message.channel.id].hasOwnProperty(Message.author.id)) {
		if (awaitedMessages[Message.channel.id][Message.author.id].callback(Message)) {
			awaitedMessages[Message.channel.id][Message.author.id].resolve(Message);
		}
	}
});


process.once('uncaughtException', (err) => {
	console.log("[SHARD "+DiscordCards.shard.id+"] Got error "+err.stack);
	//DiscordCards.IP.kill();
	setTimeout(() => {
		process.exit(0);
	}, 2500);
});

process.on('unhandledRejection', (reason, p) => {
	console.log("[SHARD "+DiscordCards.shard.id+"] REJECTED at "+reason.stack);
	//console.log("Unhandled Rejection at ", p, 'reason ', reason);
});
