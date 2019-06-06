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
	Execute: (Args, message, _, serverdata) => {
		let Server = new DiscordCards.classHandler.classes.Server(message.guild ? message.guild.id : "dm");
		if(message.channel.type === "dm"){
			message.channel.send(_('no_use_pms'));
			return;
		}

		if(!(message.guild.owner.id === message.author.id || message.member.roles.find('name', serverdata.adminrole) || message.author.id === DiscordCards.Config.owner)){
			message.channel.send(_('invalid_settings_perms', {role: serverdata.adminrole}));
			return;
		}
		if(Args[0] === undefined){
			message.channel.send(`${_('adminrole')} ${serverdata.adminrole}\n${_('prefix')} \`${serverdata.prefix}\`\n${_('locale')} \`${serverdata.locale}\`\n${_('react')} ${emojiOrText(_, message, serverdata.react)}`);
			return;
		}

		if(Args[1] === undefined){
			switch(Args[0].toLowerCase()){
			case "adminrole":
				message.channel.send(`${_('adminrole')} ${serverdata.adminrole}`);
				break;
			case "prefix":
				message.channel.send(`${_('prefix')} \`${serverdata.prefix}\``);
				break;
			case "locale":
				message.channel.send(`${_('locale')} \`${serverdata.locale}\``);
				break;
			case "react":
			case "reactions":
				message.channel.send(`${_('react')}} ${emojiOrText(_, message, serverdata.react)}`);
				break;
			default:
				message.channel.send(_('not_setting', { user: message.author.username }));
				break;
			}
			return;
		}

		switch(Args[0].toLowerCase()){
			case "prefix":
				if(Args[1] === undefined || Args[1] === "") {message.reply(_('invalid_arg')); return;};
				Server.setPrefix(Args[1]).then(() => {
					message.channel.send(_('prefix_setting', { prefix: Args[1] }));
				}).catch((e) => {Common.sendError(message, e);});
				break;
			case "adminrole":
				if(Args[1] === undefined || Args[1] === "") {message.reply(_('invalid_arg')); return;};
				Server.setAdminRole(Args.slice(1).join(" ")).then(() => {
					message.channel.send(_('adminrole_setting', { role: Args.slice(1).join(" ") }));
				}).catch((e) => {Common.sendError(message, e);});
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
					if(file === serverdata.locale){
						locales.push(`**${locale._emoji ? (locale._emoji.startsWith("$") ? `:${locale._emoji.slice(1)}: ` : `:flag_${locale._emoji}: `) : ""}\`${file}\` ${locale._name}** \`[${num}%]\``);
					}else{
						locales.push(`${locale._emoji ? (locale._emoji.startsWith("$") ? `:${locale._emoji.slice(1)}: ` : `:flag_${locale._emoji}: `) : ""}\`${file}\` ${locale._name} \`[${num}%]\``);
					}
				});
				if(Args[1].toLowerCase() === "list"){
					message.channel.send(locales.join("\n"));
					return;
				}
				if(!ok){
					message.channel.send(_('invalid_locale'));
					return;
				}
				let msg = DiscordCards.locale.render(Args[1], 'locale_setting', { locale: Args[1] });
				Server.setLocale(Args[1]).then(() => {
					message.channel.send(msg);
				}).catch((e) => {Common.sendError(message, e);});
				break;
			case "react":
			case "reactions":
				if(["on", "yes", "accept", "allow", "ok", "true"].includes(Args[1].toLowerCase())){
					Server.setReact(true).then(() => {
						message.channel.send(_('react_on'));
					}).catch((e) => {Common.sendError(message, e);});
				}else if(["off", "no", "decline", "deny", "false"].includes(Args[1].toLowerCase())){
					Server.setReact(false).then(() => {
						message.channel.send(_('react_off'));
					}).catch((e) => {Common.sendError(message, e);});
				}else{
					message.channel.send(_('invalid_bool', {user:message.author.username}));
				}
				break;
			default:
				message.channel.send(_('not_setting', { user: message.author.username }));
				break;
		}
	},
	Description: "Edit or view server settings.",
	Usage: "<setting [value]>",
	Extra: {
		"_(help_extra.settings)": [
			"`prefix` - _(help_extra.setting_string)",
			"`adminrole` - _(help_extra.setting_string)",
			"`locale` - _(help_extra.setting_string)",
			"`react` - _(help_extra.setting_bool)"
		],
		"_(help_extra.note)": [
			"_(help_extra.setting_note_locale_list)"
		]
	},
	Cooldown: 1,
	Category: "Stats",
	Aliases: ["ss"]
}