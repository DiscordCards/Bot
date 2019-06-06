module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner){
			try{
				message.channel.send(`Restarting the bot.`).then(() => {
					DiscordCards.shard.broadcastEval("process.exit(0)");
				});
			}catch(e){
				Common.sendError(message, e);
			}
		}
	},
	Description: "Restarts the bot.",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
};