module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}

			if(Args.length >= 1){
				DiscordCards.classHandler.classes.Badge.getAll().then((badges) => {
					User.getClubs().then(clubs => {
						if(clubs.length < 5){
							if(Args.join(" ").length > 32){
								message.channel.send(_('club_name_limit', {user:message.author.username}));
								return;
							}
							DiscordCards.classHandler.classes.Club.nameExists(Args.join(" ")).then(exists=>{
								if(!exists){
									message.channel.send(_('club_name_exists', {user:message.author.username}));
									return;
								}
								User.createClub(Args.join(" ")).then(()=>{
									message.channel.send(_('club_create'));
								}).catch((e) => {Common.sendError(message, e);});
							}).catch((e) => {Common.sendError(message, e);});
						}else{
							message.channel.send(_('club_name_exists', {user:message.author.username}));
						}
					}).catch((e) => {Common.sendError(message, e);});
				}).catch((e) => {Common.sendError(message, e);});
			}else{
				message.channel.send(_('club_specify_name'));
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Create a club",
	Usage: "[name]",
	Cooldown: 1,
	Category: "Clubs"
}