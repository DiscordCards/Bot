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
					let done = !itms.map(i=>!isNaN(user.inv[i]) && user.inv[i] > 0).includes(false);
					if(done){
						User.setQuest(null).then(() => {
							Promise.all(itms.map(i=>User.removeItems(i, 1))).then(()=>{
								User.addMoney(reward).then(() => {
									message.channel.send(`${_('completed_quest')} **+${reward}** :dollar:`);
								}).catch((e) => {Common.sendError(message, e);});
							}).catch((e) => {Common.sendError(message, e);});
						}).catch((e) => {Common.sendError(message, e);});
					}else{
						message.channel.send(`${_('quest_no_cards')} ${itms.sort((a,b)=>Array.pickOff(items, {id:a}).name>Array.pickOff(items, {id:b}).name).filter(i=>!(!isNaN(user.inv[i]) && user.inv[i] > 0)).map(i=>`\`${Array.pickOff(items, {id:i}).name}\``).join(", ")}`)
					}
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Execute your quest for rewards.",
	Usage: "",
	Cooldown: 2,
	Category: "Quests",
	Aliases: ["checkquest","executequest","qexecute"]
}