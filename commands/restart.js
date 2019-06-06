module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner){
			try{
				message.channel.send(`Restarting shard.`).then(() => {
					process.exit(0);
				});
			}catch(e){
				Common.sendError(message, e);
			}
		}
	},
	Description: "Restarts the current shard.",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
};