module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}
			if(Args.length >= 1){
				let id = Args[0].toLowerCase();
					
				let Offer = new DiscordCards.classHandler.classes.Market(id);

				Offer.get().then((trade) => {
					if(trade === null){
						message.channel.send(_('unknown_offer', {user:message.author.username}));
						return;
					}
					if(trade.from !== message.author.id){
						message.channel.send(_('dont_own_offer', {user:message.author.username}));
						return;
					}

					DiscordCards.classHandler.classes.Card.getAll().then((items) => {
						DiscordCards.classHandler.classes.Series.getAll().then((series) => {
							let y = {};

							items.map((a) => {
								y[a.id] = a;
							});
							series.map((a) => {
								a.name += ` ${_('pack')}`;
								y["pack"+a.id] = a;
							});

							let sold = 0;
							let price = 0;
							let item = "0";
							let total = 0;
							let gold = 0;
							let left = 0;

							if(trade.type === "sell"){
								sold = trade.sold;
								price = trade.sell.price;
								item = Object.keys(trade.sell.item)[0];
								total = trade.sell.item[item];
								gold = sold*price;
								left = total-sold;
							}else{
								sold = trade.bought;
								price = trade.buy.price;
								item = Object.keys(trade.buy.item)[0];
								total = trade.buy.item[item];
								left = sold;
								gold = (total-left)*price;
							}

							User.addItems(item, left).then(() => {
								User.addMoney(gold).then(() => {
									Offer.remove().then(() => {
										let msg = _('offer_results', {user:message.author.username,id:id});

										if(gold > 0){
											msg += `${gold.formatNumber()} :dollar:`;
										}

										if(gold > 0 && left > 0){
											msg += ` and `;
										}

										if(left > 0){
											msg += `\`${left}x\` ${y[item].name}`;
										}

										message.channel.send(msg);
									}).catch((e) => {Common.sendError(message, e); });
								}).catch((e) => {Common.sendError(message, e); });
							}).catch((e) => {Common.sendError(message, e); });
						}).catch((e) => {Common.sendError(message, e); });
					}).catch((e) => {Common.sendError(message, e); });
				}).catch((e) => {Common.sendError(message, e); });
			}else{
				message.channel.send(_('no_offer_stop', {user:message.author.username}));
			}
		}).catch((e) => {Common.sendError(message, e); });
	},
	Description: 'Stops an offer',
	Usage: "<trade id>",
	Cooldown: 1,
	Category: "Market",
	Aliases: ["gmstop","gbstop","stopoffer"]
}