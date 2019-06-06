module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner || DiscordCards.Config.devs.includes(message.author.id)){
			let id = Args[0];
			if(message.mentions.users.size >= 1){
				id = message.mentions.users.array()[0].id;
				if(id === DiscordCards.user.id){
					if(message.mentions.users.size >= 2){
						id = message.mentions.users.array()[1].id;
					}else{
						id = Args[0];
					}
				}
			}
			let User = new DiscordCards.classHandler.classes.User({id:id});
			User.get().then(user => {
				if(user === null){
					User.ensure().then(()=>{
						User.create().then(()=>{
							User.get().then(user => {
								message.channel.send(`Force started user ${user.name}.`);
							}).catch((e) => {Common.sendError(message, e);});
						}).catch((e) => {Common.sendError(message, e);});
					}).catch((e) => {Common.sendError(message, e);});
				}else{
					message.channel.send(`Sorry, ${message.author.username}, but that user started already.`);
				}
			}).catch((e) => {Common.sendError(message, e);});
		}
	},
	Description: "Starts a user.",
	Usage: "[@mention/id]",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}