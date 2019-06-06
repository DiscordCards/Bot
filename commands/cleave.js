module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}

			if(Args.length >= 1){
				DiscordCards.classHandler.classes.Club.getByName(Args.join(" ")).then((club) => {
					if(!club){
						message.channel.send(_('no_club'));
						return;
					}
					let Club = new DiscordCards.classHandler.classes.Club(club.id);
					let cm = new DiscordCards.classHandler.classes.ClubMembers(club.members);
					if(cm.exists(message.author)){
						if(cm.isOwner(message.author)){
							Club.remove(message.author.id).then(()=>{
								message.channel.send(_('club_disband'));
								Object.keys(club.members).map(id => {
									if(id === message.author.id) return;
									let NewUser = new DiscordCards.classHandler.classes.User({id:id});
									NewUser.get().then(nuser => {
										if(!nuser || !nuser.settings.notifs) return;
										DiscordCards.fetchUser(id).then((user) => {
											if(user !== null){
												user.send(_('club_notif_disband', {user:message.author.username,club:club.name}));
											}
										}).catch((e) => {Common.sendError(message, e); });
									}).catch((e) => {Common.sendError(message, e); });
								})
							}).catch((e) => {Common.sendError(message, e);});
						}else{
							Club.removeMember(message.author.id).then(()=>{
								message.channel.send(_('club_left'));
							}).catch((e) => {Common.sendError(message, e);});
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
	Description: "Leave a club, doing this as a owner disbands the club.",
	Usage: "[name]",
	Cooldown: 1,
	Category: "Clubs"
}