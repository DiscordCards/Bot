module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return; 
			}
			DiscordCards.classHandler.classes.Card.getAll().then((items) => {
				DiscordCards.classHandler.classes.Series.getAll().then((series) => {
					let reward = 0;
					let itms = [];
					let itemmapfunc = ()=>{
						let item = Array.random(items.filter(c=>c.series));
						if(itms.includes(item.id)) return itemmapfunc();
						switch(item.rarity){
							case "c":
								reward += Common.rInt(50,70);
								break;
							case "uc":
								reward += Common.rInt(100,170);
								break;
							case "r":
								reward += Common.rInt(200,300);
								break;
							case "sr":
								reward += Common.rInt(1000,1150);
								break;
						}
						itms.push(item.id);
						return;
					}
					[1,2,3,4,5].map(itemmapfunc);
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
							name: user.quest ? _('changed_quest') : _('started_quest'),
							icon_url: message.author.displayAvatarURL
						},
						fields: [
							{
								name: _('cards_needed'),
								value: itms.sort((a,b)=>Array.pickOff(items, {id:b}).name>Array.pickOff(items, {id:b}).name).map(i=>`${!isNaN(user.inv[i]) && user.inv[i] > 0 ? "<:trelloCheck:245758456814895105>" : "<:trelloUncheck:258364226567929858>"} ${Array.pickOff(items, {id:i}).name}`).join("\n")
							},
							{
								name: _('reward'),
								value: reward.toString()+" :dollar:"
							}
						]
					}
					User.setQuest({items:itms,reward:reward}).then(() => {
						if(embedPerms){
							message.channel.send("", {embed:embed})
						}else{
							message.channel.send(`__**${user.quest ? _('changed_quest') : _('started_quest')}**__\n${itms.sort((a,b)=>Array.pickOff(items, {id:a}).name>Array.pickOff(items, {id:b}).name).map(i=>`${!isNaN(user.inv[i]) && user.inv[i] > 0 ? "✅" : "❎"} ${Array.pickOff(items, {id:i}).name}`).join("\n")}\n**${_('reward')}**: ${reward.toString()+" :dollar:"}`)
						}
					}).catch((e) => {Common.sendError(message, e);});
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Get a new quest.",
	Usage: "",
	Cooldown: 21600,
	Category: "Quests",
	Aliases: ["getquest","questget"]
}