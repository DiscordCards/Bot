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
							Club.setDesc(cargs.join(" ")).then(()=>{
								message.channel.send(_('club_set_desc'));
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
	Description: "Edits the description of a club.",
	Usage: "[name] | [desc]",
	Cooldown: 1,
	Category: "Clubs",
	Aliases: ["cedesc"]
}