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
					if(club.bans.includes(message.author.id)){
						message.channel.send(_('club_join_banned'));
						return;
					}
					let Club = new DiscordCards.classHandler.classes.Club(club.id);
					let cm = new DiscordCards.classHandler.classes.ClubMembers(club.members);
					if(!cm.exists(message.author)){
						if(club.settings.open || club.invites.includes(message.author.id)){
							Club.addMember(message.author.id).then(()=>{
								message.channel.send(_('club_join'));
								if(club.invites.includes(message.author.id)){
									Club.removeInvite(message.author.id).catch((e) => {Common.sendError(message, e);});
								}
							}).catch((e) => {Common.sendError(message, e);});
						}else{
							message.channel.send(_('club_join_closed'));
						}
					}else{
						message.channel.send(_('already_in_club'));
					}
				}).catch((e) => {Common.sendError(message, e);});
			}else{
				message.channel.send(_('club_specify_name'));
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Join a club.",
	Usage: "[name]",
	Cooldown: 1,
	Category: "Clubs"
}