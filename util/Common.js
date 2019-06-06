const rethink = require('rethinkdb');
const Fuse = require("fuse.js");
const fuzzy = require("fuzzy");
module.exports = {
	sendNoStart: function(message, prefix){
		message.reply("Please create your account by using the `"+(prefix || DiscordCards.Config.prefix.default)+"stats` command.")
	},

	sendStatus: function(type, message){
		let json = {
			author: { name: DiscordCards.user.username, avatar_url: DiscordCards.user.displayAvatarURL },
			description: message || "",
			footer: { text: `Shard ${DiscordCards.shard.id} | Version ${DiscordCards.Config.version}` }
		};
		switch(type){
			case 'launch':
				json.title = "Shard Launch";
				json.color = 0x2ecc71;
				break;
			case 'reconnect':
				json.title = "Shard Attempting Reconnect";
				json.color = 0xd35400;
				break;
			case 'resume':
				json.title = "Shard Resumed Connection";
				json.color = 0xe67e22;
				break;
			case 'disconnect':
				json.title = "Shard Disconnect";
				json.color = 0xe74c3c;
				break;
			case 'translation':
				json.title = "Translations Updated";
				json.color = 0xf1c40f;
				break;
			default:
				json.title = "Unknown Status";
				break;
		}
		request.post(DiscordCards.Config.status_url)
			.set("User-Agent", "DISCORDCARDS_STATUS")
			.send({content:'',embeds:[json]})
			.end(()=>{})
	},

	sendError: function(message, e){
		message.channel.stopTyping();
		let code = new Date().valueOf().toString(36);
		if(DiscordCards.Config.debug){
			message.reply("An error occurred! ```js\n"+e.stack+"```");
			return;
		}
		let Server = new DiscordCards.classHandler.classes.Server(message.guild ? message.guild.id : "dm");
		Server.getElseCreate(message.channel.type === "dm").then(serverdata=>{
			let _ = DiscordCards.locale.createModule(serverdata.locale);
			if(e.toString().includes("ENOMEM")){
				message.reply(_('nomem_error'));
				return;
			}
			if(e.stack.includes("BitapSearcher.search")){
				message.reply(_('query_error'));
				return;
			}
			let json = {
				content: "",
				embeds: [{
					title: "**Error!** `"+code+"`",
					color: 0xfb5757,
					description: message.content+"\n```js\n"+e.stack+"```",
					fields: [
						{
							name: "Message Info",
							value: `\`TIME\`: ${new Date()} \`${Date.now()}\`\n\`MESSAGE_ID\`: ${message.id}\n\`USER\`: ${message.author.username}*#${message.author.discriminator}* \`${message.author.id}\`\n\`CHANNEL_TYPE\`: ${message.channel.type}`
						},
						{
							name: "Client Info",
							value: `\`SHARD_ID\`: ${DiscordCards.shard.id}\n\`VERSION\`: ${DiscordCards.Config.version}\n\`USER_COUNT\`: ${DiscordCards.users.array().length}\n\`GUILD_COUNT\`: ${DiscordCards.guilds.array().length}\n\`DATABASE_NAME\`: ${DiscordCards.Config.r.db}`
						}
					]
				}]
			}
			if(message.channel.type !== "dm"){
				json.embeds[0].fields[0].value += `\n\`CHANNEL_ID\`: ${message.channel.id}\n\`CHANNEL_NAME\`: ${message.channel.name}`;
				json.embeds[0].fields[0].value += `\n\`GUILD_ID\`: ${message.guild.id}\n\`GUILD_NAME\`: ${message.guild.name}`;
			}
			request.post(DiscordCards.Config.report_url)
			.set("User-Agent", "DISCORDCARDS_REPORTS")
			.send(json)
			.end((err2,res)=>{
				message.reply(_('error', { code: code }));
			})
		}).catch(e=>{
			if(e.stack.match(/Connection\sis\sclosed/) && !DiscordCards.Lockdown) this.checkRDBConn(message, e);
		});
	},

	updateServers: function(count){
		request.post(`https://discord.bots.gg/api/v1/bots/${DiscordCards.user.id}/stats`)
			.set('Authorization', DiscordCards.Config.dbotsgg)
			.send({guildCount: count})
			.end(()=>{});
		request.post(`https://discordbots.org/api/bots/${DiscordCards.user.id}/stats`)
			.set('Authorization', DiscordCards.Config.dborg)
			.send({server_count: count})
			.end(()=>{});
		request.post('https://www.carbonitex.net/discord/data/botdata.php')
			.send({key: DiscordCards.Config.carbon, servercount: count})
			.end(()=>{})
		request.post(`https://listcord.com/api/bot/${DiscordCards.user.id}/guilds`)
			.set('Authorization', DiscordCards.Config.listcord)
			.send({guilds: count})
			.end(()=>{})
		rdb.r.table("staticData").insert({id:"server_count", value: count}, {conflict: "update"}).run(rdb.conn)
	},

	checkPerm: function(user, server){
		if(server.owner.user.id==user.id){ return true }
		if(user.id == '158049329150427136'){ return true }
		return server.member(user).roles.array().map(r => r.id == '275732963419750400').includes(true)
	},

	rInt: function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	rBool: function(){
		return this.rInt(0,1) === 1;
	},

	qSearch: function(items, item, key = 'name'){
		return fuzzy.filter(item, items, {
			extract: el => el[key]
		}).map(el => el.original);
	},

	fjsSearch: function(items, item, key){
		let options = {
			shouldSort: true,
			threshold: 0.2,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			keys: [key]
		};

		let fuse = new Fuse(items, options);
		return fuse.search(item);
	},

	checkRDBConn: function(message, e){
		if(e.stack.match(/Connection\sis\sclosed/) && !DiscordCards.Lockdown){
			DiscordCards.Lockdown = true;
			console.log("[SHARD "+DiscordCards.shard.id+"] Rethink connection closed, locking down.");
			let json = {
				content: "",
				embeds: [{
					title: "```Rethink Connection Closed!```",
					color: 0xcf5246,
					description: `Timestamp: ${new Date()} \`${Date.now()}\`\n**RECONNECTING**`,
					fields: [
						{
							name: "Message Info",
							value: `\`MESSAGE_ID\`: ${message.id}\n\`USER\`: ${message.author.username}*#${message.author.discriminator}* \`${message.author.id}\`\n\`CHANNEL_TYPE\`: ${message.channel.type}`
						},
						{
							name: "Client Info",
							value: `\`SHARD_ID\`: ${DiscordCards.shard.id}\n\`VERSION\`: ${DiscordCards.Config.version}\n\`USER_COUNT\`: ${DiscordCards.users.array().length}\n\`GUILD_COUNT\`: ${DiscordCards.guilds.array().length}\n\`DATABASE_NAME\`: ${DiscordCards.Config.r.db}`
						}
					]
				}]
			}
			if(message.channel.type !== "dm"){
				json.embeds[0].fields[0].value += `\n\`CHANNEL_ID\`: ${message.channel.id}\n\`CHANNEL_NAME\`: ${message.channel.name}`;
				json.embeds[0].fields[0].value += `\n\`GUILD_ID\`: ${message.guild.id}\n\`GUILD_NAME\`: ${message.guild.name}`;
			}
			request.post(DiscordCards.Config.report_url)
			.set("User-Agent", "DISCORDCARDS_REPORTS")
			.send(json)
			.end((err2,res)=>{
				rethink.connect({host: DiscordCards.Config.r.url, port: DiscordCards.Config.r.port, user: DiscordCards.Config.r.user, password: DiscordCards.Config.r.password}, (err, conn) => {
					if(err){
						let json2 = {
							content: "",
							embeds: [{
								title: "```Rethink Connection Failed to open!```",
								color: 0xef2713,
								description: `\`\`\`js\n${err.stack}\`\`\`\nTimestamp: ${new Date()} \`${Date.now()}\`\n\`SHARD_ID\`: ${DiscordCards.shard.id}\n\`VERSION\`: ${DiscordCards.Config.version}\n\`DATABASE_NAME\`: ${DiscordCards.Config.r.db}\n**RESTARTING SHARD**`
							}]
						}
						console.log("[SHARD "+DiscordCards.shard.id+"] Rethink connection failed to open, restarting.");
						request.post(DiscordCards.Config.report_url)
						.set("User-Agent", "DISCORDCARDS_REPORTS")
						.send(json2)
						.end((err,res)=>{
							process.exit(0);
						})
						return;
					}
					conn.use(DiscordCards.Config.r.db);
					global.rdb = {r: rethink, conn: conn};
					let json3 = {
						content: "",
						embeds: [{
							title: "```Rethink Connection Re-opened!```",
							color: 0x3bd02f,
							description: `Timestamp: ${new Date()} \`${Date.now()}\`\n\`SHARD_ID\`: ${DiscordCards.shard.id}\n\`VERSION\`: ${DiscordCards.Config.version}\n\`DATABASE_NAME\`: ${DiscordCards.Config.r.db}`
						}]
					}
					console.log("[SHARD "+DiscordCards.shard.id+"] Rethink connection reopened.");
					request.post(DiscordCards.Config.report_url)
					.set("User-Agent", "DISCORDCARDS_REPORTS")
					.send(json3)
					.end(()=>{DiscordCards.Lockdown = false;})
				})
			})
		}else{
			this.sendError(message, e)
		}
	}
}