module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner){
			message.channel.send("Reloading classes...").then((m) => {
				DiscordCards.classHandler.load().then(()=>{
					m.edit("Loaded all classes.");
				}).catch(e=>{
					m.edit("Failed to reload classes ```js\n"+e.stack+"```");
				});
			});
		}
	},
	Description: "Reloads all classes",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
};