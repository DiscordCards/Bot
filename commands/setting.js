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

			if(Args[0] === undefined){
				message.channel.send(`${_('displaycolor')} #${user.settings.displayColor.toString(16)}\n${_('trades')} ${emojiOrText(_, message, user.settings.trades)}\n${_('notifs')} ${emojiOrText(_, message, user.settings.notifs)}\n${_('locale')} ${user.settings.locale ? `\`${user.settings.locale}\`` : _('none')}`);
				return;
			}

			if(Args[1] === undefined){
				switch(Args[0].toLowerCase()){
				case "displaycolor":
				case "displaycolour":
					message.channel.send(`${_('displaycolor')} #${user.settings.displayColor.toString(16)}`);
					break;
				case "trades":
					message.channel.send(`${_('trades')}} ${emojiOrText(_, message, user.settings.trades)}`);
					break;
				case "notifs":
					message.channel.send(`${_('notifs')}} ${emojiOrText(_, message, user.settings.notifs)}`);
					break;
				case "locale":
					message.channel.send(`${_('locale')} ${user.settings.locale ? `\`${user.settings.locale}\`` : _('none')}`);
					break;
				default:
					message.channel.send(_('not_setting', { user: message.author.username }));
					break;
				}
				return;
			}

			switch(Args[0].toLowerCase()){
				case "displaycolor":
				case "displaycolour":
					let value = Args.splice(1, Args.length).join(" ");
					let isOk  = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i.test(value);
					if(isOk){
						let colr = value.replace(/#/g, "");
						let col = parseInt(colr, 16);
						if(col === 0){col = 1;}
						User.setSetting("displayColor", col).then(() => {
							message.channel.send(_('displaycolor_setting', {color:`#${colr}`}));
						}).catch((e) => {Common.sendError(message, e);});
					}else{
						message.channel.send(`Sorry, ${message.author.username}, but that's not a valid HEX color.`);
					}
					break;
				case "trades":
					if(["on", "yes", "accept", "allow", "ok", "true"].includes(Args[1].toLowerCase())){
						User.setSetting("trades", true).then(() => {
							message.channel.send(_('trades_on'));
						}).catch((e) => {Common.sendError(message, e);});
					}else if(["off", "no", "decline", "deny", "false"].includes(Args[1].toLowerCase())){
						User.setSetting("trades", false).then(() => {
							message.channel.send(_('trades_off'));
						}).catch((e) => {Common.sendError(message, e);});
					}else{
						message.channel.send(_('invalid_bool', {user:message.author.username}));
					}
					break;
				case "notifs":
					if(["on", "yes", "accept", "allow", "ok", "true"].includes(Args[1].toLowerCase())){
						User.setSetting("notifs", true).then(() => {
							message.channel.send(_('notifs_on'));
						}).catch((e) => {Common.sendError(message, e);});
					}else if(["off", "no", "decline", "deny", "false"].includes(Args[1].toLowerCase())){
						User.setSetting("notifs", false).then(() => {
							message.channel.send(_('notifs_off'));
						}).catch((e) => {Common.sendError(message, e);});
					}else{
						message.channel.send(`Sorry, ${message.author.username}, but I don't know what you want. Use words like \`yes\` or \`no\`.`);
					}
					break;
				case "locale":
					if(Args[1] === undefined || Args[1] === "") {message.reply(_('invalid_arg')); return;};
					let files = DiscordCards.locale.f;
					let ok = false
					let locales = [];
					Object.keyValueForEach(files, (file, locale) => {
						if(file === Args[1]) ok = true;
						let num = ((Object.keys(locale).length / Object.keys(files['en-US']).length) * 100).toFixed(2);
						if (num >= 100) num = 100;
						if(file === user.settings.locale){
							locales.push(`**${locale._emoji ? (locale._emoji.startsWith("$") ? `:${locale._emoji.slice(1)}: ` : `:flag_${locale._emoji}: `) : ""}\`${file}\` ${locale._name}** \`[${num}%]\``);
						}else{
							locales.push(`${locale._emoji ? (locale._emoji.startsWith("$") ? `:${locale._emoji.slice(1)}: ` : `:flag_${locale._emoji}: `) : ""}\`${file}\` ${locale._name} \`[${num}%]\``);
						}
					});
					if(null === user.settings.locale){
						locales.push(`\n**\`unset\` ${_('unset_locale')}**`);
					}else{
						locales.push(`\n\`unset\` ${_('unset_locale')}`);
					}
					if(Args[1].toLowerCase() === "list"){
						message.channel.send(locales.join("\n"));
						return;
					}
					if(!ok && Args[1] !== "unset"){
						message.channel.send(_('invalid_locale'));
						return;
					}
					let msg = Args[1] !== "unset" ? DiscordCards.locale.render(Args[1], 'user_locale_setting', { locale: Args[1] }) : _('locale_unset');
					User.setSetting('locale', Args[1] !== "unset" ? Args[1] : null).then(() => {
						message.channel.send(msg);
					}).catch((e) => {Common.sendError(message, e);});
					break;
				default:
					message.channel.send(_('not_setting', { user: message.author.username }));
					break;
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Edit or view settings.",
	Usage: "[setting] <value>",
	Extra: {
		"_(help_extra.settings)": [
			"`displayColor` - _(help_extra.setting_hex)",
			"`trades` - _(help_extra.setting_bool)",
			"`notifs` - _(help_extra.setting_bool)",
			"`locale` - _(help_extra.setting_string)"
		]
	},
	Cooldown: 1,
	Category: "Stats",
	Aliases: ['set']
}