module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner){
			try{
				message.channel.send(`Reloading commands from all shards..`).then(() => {
					DiscordCards.shard.broadcastEval("DiscordCards.commandHandler.load().then(()=>console.log(`[SHARD ${DiscordCards.shard.id}] Reloaded commands`)).catch(e=>console.log(`[SHARD ${DiscordCards.shard.id}] Failed to reload commands`, e))");
				});
			}catch(e){
				Common.sendError(message, e);
			}
		}
	},
	Description: "Reloads commands from all shards",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
};