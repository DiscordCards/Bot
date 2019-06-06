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
					let banner = DiscordCards.classHandler.classes.Club.banner();
					let cm = new DiscordCards.classHandler.classes.ClubMembers(club.members);
					if(cm.exists(message.author)){
						if(cm.isAdmin(message.author)){
							if(cargs[0] === undefined){
								message.channel.send(_('club_specify_code', {user:usr.username}));
								return;
							}
							try{
								let dec = new Buffer(cargs[0], 'base64').toString('ascii');
								let params = dec.split('|');
								if(params.length === 0) throw new Error("bad encoding, buckaroo.");
								let bn = params[0];
								let bc = parseInt(params[1], 36);
								if(bc === 0){bc = 1;}
								let dn = params[2];
								let dc = parseInt(params[3], 36);
								if(dc === 0){dc = 1;}
								Club.update({settings: {
									baseName: bn,
									baseColor: bc,
									designName: dn,
									designColor: dc
								}}).then(() => {
									message.channel.send(_('set_banner'));
								}).catch((e) => {Common.sendError(message, e);});
							}catch(e){message.channel.send(_('invalid_encoding'));}
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
	Description: "Sets the banner as the code generated by the [banner editor](http://discord.cards/banner-edit/).",
	Usage: "[name] | [value]",
	Cooldown: 1,
	Category: "Clubs"
}