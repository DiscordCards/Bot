module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return; 
			}
			if(!user.quest){
				message.channel.send(_('no_quest'));
				return;
			}
			DiscordCards.classHandler.classes.Card.getAll().then((items) => {
				DiscordCards.classHandler.classes.Series.getAll().then((series) => {
					let reward = user.quest.reward;
					let itms = user.quest.items;
					let embedPerms = false;
					if(message.channel.type !== "text"){
						embedPerms = true;
					}else{
						if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
							embedPerms = true;
						}
					}
					let embed = {
						color: user.settings.displayColor ? user.settings.displayColor : 0x7289da,
						author: {
							name: _('current_quest'),
							icon_url: message.author.displayAvatarURL
						},
						fields: [
							{
								name: _('cards_needed'),
								value: itms.sort((a,b)=>Array.pickOff(items, {id:a}).name>Array.pickOff(items, {id:b}).name).map(i=>`${!isNaN(user.inv[i]) && user.inv[i] > 0 ? "<:trelloCheck:245758456814895105>" : "<:trelloUncheck:258364226567929858>"} ${Array.pickOff(items, {id:i}).name}`).join("\n")
							},
							{
								name: _('reward'),
								value: reward.toString()+" :dollar:"
							}
						]
					}
					if(embedPerms){
						message.channel.send("", {embed:embed})
					}else{
						message.channel.send(`__**${_('current_quest')}**__\n${itms.sort((a,b)=>Array.pickOff(items, {id:a}).name>Array.pickOff(items, {id:b}).name).map(i=>`${!isNaN(user.inv[i]) && user.inv[i] > 0 ? "✅" : "❎"} ${Array.pickOff(items, {id:i}).name}`).join("\n")}\n**${_('reward')}**: ${reward.toString()+" :dollar:"}`)
					}
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "View your current quest.",
	Usage: "",
	Cooldown: 2,
	Category: "Quests"
}