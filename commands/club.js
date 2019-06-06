let d2h = function(i){
	return ("000000" + ((i|0)+4294967296).toString(16)).substr(-6);
}

module.exports = {
	Execute: (Args, message, _) => {
		if(Args.length >= 1){
			DiscordCards.classHandler.classes.Club.getByName(Args.join(" ")).then((club) => {
				if(!club){
					message.channel.send(_('no_club'));
				}else{
					let cm = new DiscordCards.classHandler.classes.ClubMembers(club.members);
					let Owner = new DiscordCards.classHandler.classes.User({id:cm.getOwner()});
					Owner.get().then(owner =>{
						let embedPerms = false;

						if(message.channel.type !== "text"){
							embedPerms = true;
						}else{
							if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
								embedPerms = true;
							}
						}
						let embed = {
							embed: {
								title: club.name,
								description: club.desc,
								type: "rich",
								color: club.settings.displayColor,
								thumbnail: {
									url: `https://api.discord.cards/cache/banner/${club.settings.baseName}/${d2h(club.settings.baseColor)}/${club.settings.designName}/${d2h(club.settings.designColor)}`
								},
								fields: [
									{
										name: _('owner'),
										value: owner.name,
										inline: true
									},
									{
										name: _('member_count'),
										value: `\`${_('members')}\`: ${cm.sizeIn('member')}\n\`${_('admins')}\`: ${cm.sizeIn('admin')}`,
										inline: true
									},
									{
										name: _("open"),
										value: `${club.settings.open.toString().toUpperCase()}`,
										inline: true
									},
									{
										name: _("created"),
										value: `${new Date(club.created)}`,
										inline: true
									}
								]
							}
						};
						let msg = `\`\`\`fix\n${club.name}\`\`\`${club.desc}\n\`\`\`md\n`
						msg += `<${_('owner')}: ${owner.name}>\n`
						msg += `<${_('members')}: ${cm.sizeIn('member')}>\n`
						msg += `<${_('admins')}: ${cm.sizeIn('admin')}>\n`
						msg += `<${_('open')}: ${club.settings.open.toString().toUpperCase()}>\n`
						msg += `<${_('created')}: ${new Date(club.created)}>\n`
						msg += `\`\`\``
						if(embedPerms){
							message.channel.send("", embed);
						}else{
							message.channel.send(msg);
						}
					}).catch((e) => {Common.sendError(message, e);});
				}
			}).catch((e) => {Common.sendError(message, e);});
		}else{
			message.channel.send(_('club_specify_name'));
		}
	},
	Description: "View a club",
	Usage: "[name]",
	Cooldown: 1,
	Category: "Clubs"
}