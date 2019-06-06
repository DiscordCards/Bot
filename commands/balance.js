module.exports = {
	Execute: (Args, message, _) => {
		let usr = message.author;
		if(message.mentions.users.size >= 1){
			usr = message.mentions.users.array()[0];
			if(usr.id === DiscordCards.user.id){
				if(message.mentions.users.size >= 2){
					usr = message.mentions.users.array()[1];
				}else{
					usr = message.author;
				}
			}
		}
		let User = new DiscordCards.classHandler.classes.User(usr);
		User.get().then(user => {
			if(user === null){
				if(usr.id === message.author.id){
					message.channel.send(_('no_start'));
				}else{
					message.channel.send(_('no_start_that', {user:message.author.username}));
				}
				return;
			}

			let embedPerms = false;

			if(message.channel.type !== "text"){
				embedPerms = true;
			}else{
				if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
					embedPerms = true;
				}

				if(user.money.toFixed(2).includes(".5")) User.addMoney(0.5);

				let embed = {
					color: user.settings.displayColor ? user.settings.displayColor : 0xf7b300,
					title: usr.id===message.author.id ? _('your_bal', {amount:user.money}) : _('their_bal', {amount:user.money})
				}

				let backup = usr.id===message.author.id ? _('your_bal', {amount:user.money}) : _('their_bal', {amount:user.money})

				if(embedPerms){
					message.channel.send("", {embed: embed});
				}else{
					message.channel.send(backup);
				}
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Get your own balance (or someone elses)",
	Usage: "<@mention>",
	Cooldown: 10,
	Category: "Stats",
	Aliases: ["bal", "money"]
}