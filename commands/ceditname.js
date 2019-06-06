module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}

			if(Args.length >= 3){
				if(!Args.join(" ").match(/\s\|\s/,"|")){message.channel.send(_('invalid_format')); return;}
				let c = Args.join(" ").replace(/\s\|\s/,"|").split("|");
				let cargs = c.reverse()[0].split(" ");
				DiscordCards.classHandler.classes.Club.getByName(c.slice(c.length-1).join(" ")).then((club) => {
					if(!club){
						message.channel.send(_('no_club'));
						return;
					}
					let Club = new DiscordCards.classHandler.classes.Club(club.id);
					let cm = new DiscordCards.classHandler.classes.ClubMembers(club.members);
					if(cm.exists(message.author)){
						if(cm.getOwner() == message.author.id){
							DiscordCards.classHandler.classes.Club.nameExists(cargs.join(" ")).then(exists=>{
								if(!exists){
									message.channel.send(_('club_name_exists', {user:message.author.username}));
									return;
								}
								if(cargs.join(" ").length > 32){
									message.channel.send(_('club_name_limit', {user:message.author.username}));
									return;
								}
								Club.setName(cargs.join(" ")).then(()=>{
									message.channel.send(_('club_set_name'));
									Object.keys(club.members).map(id => {
										if(id === message.author.id) return;
										let NewUser = new DiscordCards.classHandler.classes.User({id:id});
										NewUser.get().then(nuser => {
											if(!nuser || !nuser.settings.notifs) return;
											DiscordCards.fetchUser(id).then((user) => {
												if(user !== null){
													user.send(_('club_notif_rename', {
														user: message.author.username,
														oldname: club.name,
														club: cargs.join(" ")
													}));
												}
											}).catch((e) => {Common.sendError(message, e); });
										}).catch((e) => {Common.sendError(message, e); });
									})
								}).catch((e) => {Common.sendError(message, e);});
							}).catch((e) => {Common.sendError(message, e);});
						}else{
							message.channel.send(_('club_not_owner'));
						}
					}else{
						message.channel.send(_('not_in_club'));
					}
				}).catch((e) => {Common.sendError(message, e);});
			}else{
				message.channel.send(_('club_specify_name'));
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Renames a club.",
	Usage: "[name] | [newname]",
	Cooldown: 1,
	Category: "Clubs",
	Aliases: ["cename"]
}