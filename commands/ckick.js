module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}

			if(Args.length >= 2){
				DiscordCards.classHandler.classes.Club.getByName(Args.slice(1).join(" ")).then((club) => {
					if(!club){
						message.channel.send(_('no_club'));
						return;
					}
					let Club = new DiscordCards.classHandler.classes.Club(club.id);
					let cm = new DiscordCards.classHandler.classes.ClubMembers(club.members);
					if(cm.exists(message.author)){
						if(cm.isAdmin(message.author)){
							let usr = null;
							if(message.mentions.users.size >= 1){
								usr = message.mentions.users.array()[0];
								if(usr.id === DiscordCards.user.id){
									if(message.mentions.users.size >= 2){
										usr = message.mentions.users.array()[1];
									}else{
										usr = null;
									}
								}
							}
							if(!usr){
								message.channel.send(_('club_specify_user'));
								return;
							}
							if(!cm.exists(usr)){
								message.channel.send(_('user_not_in_club'));
								return;
							}
							if(club.members[usr.id] === club.members[message.author.id] || club.members[usr.id] === 'owner'){
								message.channel.send(_('cant_kick', {rank:club.members[usr.id].capFirst(),otherrank:club.members[message.author.id].capFirst()}));
								return;
							}

							if(usr !== null){
								Club.removeMember(usr.id).then(()=>{
									message.channel.send(_('club_kick', {user:usr.username}));
									let NewUser = new DiscordCards.classHandler.classes.User({id:usr.id});
									NewUser.get().then(nuser => {
										if(!nuser || !nuser.settings.notifs) return;
										DiscordCards.fetchUser(usr.id).then((user) => {
											if(user !== null){
												user.send(_('club_notif_kick', {
													user: message.author.username,
													rank: club.members[message.author.id].capFirst(),
													club: club.name
												}));
											}
										}).catch((e) => {Common.sendError(message, e); });
									}).catch((e) => {Common.sendError(message, e); });
								}).catch((e) => {Common.sendError(message, e);});
							}
						}else{
							message.channel.send(_('club_not_admin'));
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
	Description: "Kicks someone from a club.",
	Usage: "[@mention] [name]",
	Cooldown: 1,
	Category: "Clubs"
}