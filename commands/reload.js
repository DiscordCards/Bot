module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner){
			message.channel.send("Reloading commands...").then((m) => {
				DiscordCards.commandHandler.load().then(()=>{
					m.edit("Loaded all commands.");
				}).catch(e=>{
					m.edit("Failed to reload commands ```js\n"+e.stack+"```");
				});
			});
		}
	},
	Description: "Reloads commands",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
};