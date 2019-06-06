emojiOrText = (_, message, v) => {
	let extEmojiPerms = false;
	if(message.channel.type !== "text"){
		extEmojiPerms = true;
	}else{
		if(message.channel.permissionsFor(DiscordCards.user).has("USE_EXTERNAL_EMOJIS")){
			extEmojiPerms = true;
		}
	}
	return v ? (extEmojiPerms ? '<:switch_on:350172481170046979>' : _('on')) : (extEmojiPerms ? '<:switch_off:350172481560248340>' : _('off'));
}

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
								message.channel.send(`${_('designcolor')} #${club.settings.designColor.toString(16)}\n${_('displaycolor')} #${club.settings.displayColor.toString(16)}\n${_('basename')} ${club.settings.baseName.capFirst()}\n${_('designname')} ${club.settings.designName.capFirst()}\n${_('open')} ${emojiOrText(_, message, club.settings.open)}`);
								return;
							}

							if(cargs[1] === undefined){
								switch(cargs[0].toLowerCase()){
								case "basecolor":
								case "basecolour":
									message.channel.send(`${_('basecolor')} #${club.settings.baseColor.toString(16)}`);
									break;
								case "designcolor":
								case "designcolour":
									message.channel.send(`${_('designcolor')} #${club.settings.designColor.toString(16)}`);
									break;
								case "displaycolor":
								case "displaycolour":
									message.channel.send(`${_('displaycolor')} #${club.settings.displayColor.toString(16)}`);
									break;
								case "basename":
									message.channel.send(`${_('basename')} ${club.settings.baseName.capFirst()}`);
									break;
								case "designname":
									message.channel.send(`${_('displayname')} ${club.settings.designName.capFirst()}`);
									break;
								case "open":
									message.channel.send(`${_('open')} ${emojiOrText(_, message, club.settings.open)}`);
									break;
								default:
									message.channel.send(_('not_setting', {user:message.author.username}));
									break;
								}
								return;
							}
							let value = cargs.splice(1, cargs.length).join(" ");
							let isOk  = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i.test(value);

							switch(cargs[0].toLowerCase()){
								case "basecolor":
								case "basecolour":
									if(isOk){
										colr = value.replace(/#/g, "");
										col = parseInt(colr, 16);
										if(col === 0){col = 1;}
										Club.setSetting("baseColor", col).then(() => {
											message.channel.send(_('basecolor_setting', {value:`#${colr}`}));
										}).catch((e) => {Common.sendError(message, e);});
									}else{
										message.channel.send(_('invalid_hex', {user:message.author.username}));
									}
									break;
								case "designcolor":
								case "designcolour":
									if(isOk){
										colr = value.replace(/#/g, "");
										col = parseInt(colr, 16);
										if(col === 0){col = 1;}
										Club.setSetting("designColor", col).then(() => {
											message.channel.send(_('designcolor_setting', {value:`#${colr}`}));
										}).catch((e) => {Common.sendError(message, e);});
									}else{
										message.channel.send(_('invalid_hex', {user:message.author.username}));
									}
									break;
								case "displaycolor":
								case "displaycolour":
									if(isOk){
										colr = value.replace(/#/g, "");
										col = parseInt(colr, 16);
										if(col === 0){col = 1;}
										Club.setSetting("displayColor", col).then(() => {
											message.channel.send(_('displaycolor_setting', {color:`#${colr}`}));
										}).catch((e) => {Common.sendError(message, e);});
									}else{
										message.channel.send(_('invalid_hex', {user:message.author.username}));
									}
									break;
								case "basename":
									if(banner.validBaseName(value.toLowerCase())){
										Club.setSetting("baseName", value.toLowerCase()).then(() => {
											message.channel.send(_('basename_setting', {value:`#${colr}`}));
										}).catch((e) => {Common.sendError(message, e);});
									}else{
										message.channel.send(`${_('invalid_basename', {user:message.author.username})} ${banner.baseNames.map(r=>"`"+r+"`")}`);
									}
									break;
								case "designname":
									if(banner.validDesignName(value.toLowerCase())){
										Club.setSetting("designName", value.toLowerCase()).then(() => {
											message.channel.send(_('designname_setting', {value:`#${colr}`}));
										}).catch((e) => {Common.sendError(message, e);});
									}else{
										message.channel.send(`${_('invalid_designname', {user:message.author.username})} ${banner.designNames.map(r=>"`"+r+"`")}`);
									}
									break;
								case "open":
									if(["on", "yes", "accept", "allow", "ok", "true", "open"].includes(value.toLowerCase())){
										Club.setSetting("open", true).then(() => {
											message.channel.send(_('club_open_yes'));
										}).catch((e) => {Common.sendError(message, e);});
									}else if(["off", "no", "decline", "deny", "false", "close"].includes(value.toLowerCase())){
										Club.setSetting("open", false).then(() => {
											message.channel.send(_('club_open_no'));
										}).catch((e) => {Common.sendError(message, e);});
									}else{
										message.channel.send(_('invalid_bool', {user:message.author.username}));
									}
									break;
								default:
									message.channel.send(_('not_setting', {user:message.author.username}));
									break;
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
	Description: "Edits or views setting in the club.",
	Usage: "[name] | [setting] <value>",
	Extra: {
		"_(help_extra.settings)": [
			"`displayColor` - _(help_extra.setting_hex)",
			"`baseName` - _(help_extra.setting_base_name)",
			"`designName` - _(help_extra.setting_design_name)",
			"`baseColor` - _(help_extra.setting_hex)",
			"`designColor` - _(help_extra.setting_hex)",
			"`open` - _(help_extra.setting_bool)"
		]
	},
	Cooldown: 1,
	Category: "Clubs",
	Aliases: ["cs"]
}