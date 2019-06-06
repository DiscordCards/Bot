module.exports = {
	Execute: (Args, message) => {
		if(Common.checkPerm(message.author.id, message.guild) || message.author.id === DiscordCards.Config.owner || DiscordCards.Config.devs.includes(message.author.id)){
			DiscordCards.shard.fetchClientValues('users.size').then(users => {
			 	let IPCUsers = users.reduce((prev, val) => prev + val, 0);
			 	let ShardUsers = users[DiscordCards.shard.id];
			
			 	DiscordCards.shard.fetchClientValues('channels.size').then((channels) => {

			 		let IPCChannels = channels.reduce((prev, val) => prev + val, 0);
			 		let ShardChannels = channels[DiscordCards.shard.id];

					DiscordCards.shard.fetchClientValues('guilds.size').then(servers => {
						let Servers = servers.reduce((prev, val) => prev + val, 0);

				 		DiscordCards.shard.broadcastEval("process.memoryUsage().heapUsed / 1000000").then((Memory) => {
							let TotalMem = Memory.reduce((prev, val) => prev + val, 0);
							let ShardMem = Memory[DiscordCards.shard.id];
							DiscordCards.classHandler.classes.StaticData.getAllCount().then(o => {
								if(Args[0] === "--compact" || Args[0] === "-c"){
									let msg = ["```prolog"];
									msg.push(`DCards Version : ${DiscordCards.Config.version}`);
									msg.push(`  D.JS Version : ${require('discord.js').version}`);
									msg.push(`         Shard : ${DiscordCards.options.shardId}/${DiscordCards.options.shardCount}`);
									msg.push(`      Database : ${DiscordCards.Config.r.db}`);
									msg.push(`  Memory Usage : ${ShardMem.toFixed(2)}/${TotalMem.toFixed(2)} MB`);
									msg.push(`       Servers : ${Servers.formatNumber()}, shard: ${DiscordCards.guilds.size.formatNumber()}`);
									msg.push(`      Channels : ${IPCChannels.formatNumber()}, shard: ${ShardChannels.formatNumber()}`);
									msg.push(`         Users : ${IPCUsers.formatNumber()}, shard: ${ShardUsers.formatNumber()}`);
									msg.push(`  Shard Uptime : ${process.uptime().toString().toHHMMSS() || "???"}`);
									msg.push(`----------------`);
									msg.push(`       Players : ${o.users.formatNumber()}`);
									msg.push(`        Trades : ${o.trades.formatNumber()}`);
									msg.push(` Market Offers : ${o.market.formatNumber()}`);
									msg.push("```");
									message.channel.send(msg.join("\n"));
									return;
								}
								let DataMessage = {
									"embed": {
										"title": "Discord Cards Stats",
										"type": "rich",
										"color": 0xf44274,
										"fields": [
											{
												"name": "Version",
												"value": DiscordCards.Config.version,
												"inline": true
											},
											{
												"name": "Shards",
												"value": DiscordCards.options.shardCount,
												"inline": true
											},
											{
												"name": "Current Shard",
												"value": DiscordCards.options.shardId,
												"inline": true
											},
											{
												"name": "Servers",
												"value": Servers.formatNumber(),
												"inline": true
											},
											{
												"name": "Servers on this shard",
												"value": DiscordCards.guilds.size.formatNumber(),
												"inline": true
											},
											{
												"name": "Users",
												"value": IPCUsers.formatNumber(),
												"inline": true
											},
											{
												"name": "Users on this shard",
												"value": ShardUsers.formatNumber(),
												"inline": true
											},
											{
												"name": "Channels",
												"value": IPCChannels.formatNumber(),
												"inline": true
											},
											{
												"name": "Channels on this shard",
												"value": ShardChannels.formatNumber(),
												"inline": true
											},
											{
												"name": "Memory Usage (Total)",
												"value": `${TotalMem.toFixed(2)} MB`,
												"inline": true
											},
											{
												"name": "Memory Usage (Shard)",
												"value": `${ShardMem.toFixed(2)} MB`,
												"inline": true
											},
											{ 
												"name": "Uptime (Shard)",
												"value": process.uptime().toString().toHHMMSS() || "???",
												"inline": true
											},
											{ 
												"name": "Database",
												"value": DiscordCards.Config.r.db,
												"inline": true
											},
											{ 
												"name": "Players",
												"value": o.users.formatNumber(),
												"inline": true
											},
											{ 
												"name": "Trades",
												"value": o.trades.formatNumber(),
												"inline": true
											},
											{ 
												"name": "Market Offers",
												"value": o.market.formatNumber(),
												"inline": true
											}
										]
									}
								}
								message.channel.send('', DataMessage);
							}).catch((e) => {Common.sendError(message, e);});
						}).catch((e) => {Common.sendError(message, e);});
					}).catch((e) => {Common.sendError(message, e);});
				}).catch((e) => {
					Common.sendError(message, e);
				});
			}).catch((e) => {
				Common.sendError(message, e);
			});
		}
	},
	Description: "Gets bot stats.",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}