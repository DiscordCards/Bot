module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}

			if(Args.length >= 4){
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
							if(!['admin','member'].includes(cargs[1].toLowerCase())){
								message.channel.send(_('invalid_rank_name'));
								return;
							}

							if(usr !== null){
								Club.setRank(usr.id, cargs[1].toLowerCase()).then(()=>{
									message.channel.send(_('club_rank', {user:usr.username,rank:cargs[1].toLowerCase().capFirst()}));
									let NewUser = new DiscordCards.classHandler.classes.User({id:usr.id});
									NewUser.get().then(nuser => {
										if(!nuser || !nuser.settings.notifs) return;
										DiscordCards.fetchUser(usr.id).then((user) => {
											if(user !== null){
												user.send(_('club_notif_rank', {user:message.author.username,rank:cargs[1].toLowerCase().capFirst(),club:club.name}));
											}
										}).catch((e) => {Common.sendError(message, e); });
									}).catch((e) => {Common.sendError(message, e); });
								}).catch((e) => {Common.sendError(message, e);});
							}
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
	Description: "Changes the rank of a person in a club.",
	Usage: "[name] | [@mention] [newrank]",
	Cooldown: 1,
	Category: "Clubs"
}