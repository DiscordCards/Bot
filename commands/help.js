module.exports = {
	Execute: (args, message, _) => {
		let parseTags = string => {
			return string.replace(/_\((([a-z]|\.|_)+)\)/g, a=>_(a.slice(2).slice(0,a.length-3)));
		}
		let embedPerms = false;
		let prefix = DiscordCards.Config.prefix.default;

		if(message.channel.type !== "text"){
			embedPerms = true;
		}else{
			if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
				embedPerms = true;
			}
		}

		if(args[0] != undefined && args[0] != "" && args[0] != "--show"){
			let command = DiscordCards.commandHandler.search(args[0]);
			if(command != undefined && command.Name != undefined){
				let embed = {
					color: 0x7289da,
					fields: []
				}
				let backup = ""

				console.log(`help_desc.${command.Name}`)
				backup += `__**${prefix}${command.Name}**__\n\n`;
				backup += `${_.valid(`help_desc.${command.Name}`) ? _(`help_desc.${command.Name}`) : command.Description}\n`;
				backup += `**${_('usage')}**: \`${prefix+command.Name} ${command.Usage}\`\n`;
				backup += `**${_('cooldown')}**: \`${command.Cooldown}\`\n`;
				if(command.Aliases){backup += `**${_('aliases')}**: \`${command.Aliases.map(a=>"`"+prefix+a+"`")}\`\n\n`};
				if(command.Extra){
					for(let Extra in command.Extra){
						backup += `**${parseTags(Extra)}**: `;
						if(Array.isArray(command.Extra[Extra])){
							backup += `${command.Extra[Extra].map(str=>parseTags(str)).join(', ')}`;
						}
						backup += "\n";
					}
				}

				embed.title = `${prefix}${command.Name}`;
				embed.description = _.valid(`help_desc.${command.Name}`) ? _(`help_desc.${command.Name}`) : command.Description;
				embed.fields.push({name: _('usage'), value: "`"+prefix+command.Name+` ${command.Usage}\``});
				embed.fields.push({name: _('cooldown'), value: command.Cooldown,inline: true});
				if(command.Aliases){embed.fields.push({name: _('aliases'), value: command.Aliases.map(a=>"`"+prefix+a+"`").join(", "),inline: true});};
				if(command.Extra){
					for(let Extra in command.Extra){
						let o = {
							name: parseTags(Extra),
							value: "",
							inline: true
						}
						if(Array.isArray(command.Extra[Extra])){
							o.value = `${command.Extra[Extra].map(str=>parseTags(str)).join('\n')}`;
						}else{
							o.value = parseTags(command.Extra[Extra]);
						}
						embed.fields.push(o);
					}
				}

				if(embedPerms){
					message.channel.send("", {embed: embed});
				}else{
					message.channel.send(backup);
				}
			}
		}else{
			let commands = DiscordCards.commandHandler.commands;
			let embed = {
				color: 0x7289da,
				footer: {
					text: _("help_more_info")
				},
				fields: []
			};
			let backup = `__**${_('commands')}**__\n\n`
			let helpobj = {};
			Object.keys(commands).map(e => { 
				if(commands[e].Unlisted && !(message.author.id === DiscordCards.Config.owner || DiscordCards.Config.devs.includes(message.author.id))){return;}
				if(helpobj[commands[e].Category]){
					helpobj[commands[e].Category].push(`${prefix+e}`);
				}else{
					helpobj[commands[e].Category] = [`${prefix+e}`];
				}
			});
			Object.keys(helpobj).map(e => {
				embed.fields.push({
					name: `**${_(e.toLowerCase())}**`,
					value: helpobj[e].map(v=>`• ${v}`).join("\n"),
					inline: true
				});

				backup += `**${_(e.toLowerCase())}**: ${helpobj[e].join(" • ")}\n`
			});
			if(args[0] === "--show"){
				if(embedPerms){
					message.channel.send("", {embed: embed});
				}else{
					message.channel.send(backup);
				}
			}else{
				message.author.send("", {embed: embed});
				message.channel.send(_('send_to_pm'));
			}
		}
	},
	Description: "Shows the help message",
	Usage: "[command]",
	Cooldown: 10,
	Category: "General",
	Aliases: ["?"]
}