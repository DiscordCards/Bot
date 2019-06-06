let thisClass = {
	translateInv: function(data, _){
		let itms = [];
		let y = {};
		let z = {};
		data.cards.map((c) => {
			y[c.id] = c;
		});
		data.series.map((c) => {
			z[c.id] = c;
		});

		if(Object.keys(data.inv).length >= 1){
			Object.keys(data.inv).map((a) => {

				if(data.inv[a] > 0 && data.inv[a] !== null){

					let ps = "";
					if(a.startsWith("pack") || y[a] !== undefined){
						let i = Array.pickOff(data.cards, {id: a})
						if(a.startsWith("pack")){
							ps = `${data.inv[a].formatNumber()} x ${z[a.slice(4)].name} ${_('pack')}`;
							itms.push(ps);
						}else{
							ps = `${data.inv[a].formatNumber()} x ${i.name}`;
							itms.push(ps);
						}
					}
				}
			});
		}else{
			itms.push(`\`${_('none')}\``);
		}

		return itms;
	}
}

module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}
			User.getCurrentTrade().then(trade => {
				if(trade !== null){
					let Trade = new DiscordCards.classHandler.classes.Trade(trade.id);
					let oid = null;
					if(trade.trader === message.author.id){
						oid = trade.tradee;
					}else{
						oid = trade.trader;
					}
					let NewUser = new DiscordCards.classHandler.classes.User({id: oid});
					Promise.all([
						NewUser.get(),
						DiscordCards.classHandler.classes.Card.getAll(),
						DiscordCards.classHandler.classes.Series.getAll()
					]).then(arr => {
						let ouser = arr[0];
						let cards = arr[1];
						let series = arr[2];
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
							title: _('trading'),
							fields: [
								{
									name: _('trader'),
									value: trade.trader === message.author.id ? message.author.username : ouser.name
								},
								{
									name: _('tradee'),
									value: trade.tradee === message.author.id ? message.author.username : ouser.name
								},
								{
									name: _('trader_items'),
									value: thisClass.translateInv({inv: trade.trader_items, cards: cards, series: series}, _).join("\n"),
									inline: true
								},
								{
									name: _('tradee_items'),
									value: thisClass.translateInv({inv: trade.tradee_items, cards: cards, series: series}, _).join("\n"),
									inline: true
								},
								{
									name: _('okayed'),
									value: trade.ok !== "" ? trade.ok === message.author.id ? message.author.username : ouser.name : "`No`"
								},
								{
									name: _('trader_currency'),
									value: `${trade.trader_money}`,
									inline: true
								},
								{
									name: _('tradee_currency'),
									value: `${trade.tradee_money}`,
									inline: true
								}
							]
						}

						let backup = `\`\`\`xml\n< ${_('trade')} >\n<${_('trader')}: ${
							trade.trader === message.author.id ? message.author.username : ouser.name
						}>\n<${_('tradee')}: ${
							trade.tradee === message.author.id ? message.author.username : ouser.name
						}>\n\`\`\``

						backup += `\n\`\`\`ini\n[${_('trader_items')}]\n${
							thisClass.translateInv({inv: trade.trader_items, cards: cards, series: series}, _).join("\n")
						}\n[${_('tradee_items')}]\n${
							thisClass.translateInv({inv: trade.tradee_items, cards: cards, series: series}, _).join("\n")
						}\`\`\``

						if(embedPerms){
							message.channel.send("", {embed: embed});
						}else{
							message.channel.send(backup);
						}
					}).catch((e) => {Common.sendError(message, e);});
				}else{
					message.channel.send(`Sorry, ${message.author.username}, but you don't have a trade.`);
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Shows the current trade standing.",
	Usage: "",
	Cooldown: 5,
	Category: "Trading"
}