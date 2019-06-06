module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}
			if(Args.length >= 1){
				let amount = 1;
				let id = Args[0].toLowerCase();
				let matches = Args.join(" ").replace(/\s*$/, "").match(/\s\d+$/);
				if(matches){
					if(!isNaN(matches[0])){
						amount = parseInt(matches[0]);
					}
				}

				let Offer = new DiscordCards.classHandler.classes.Market(id);

				Offer.get().then((trade) => {
					if(trade === null){
						message.channel.send(_('unknown_offer', {user:message.author.username}));
						return;
					}

					if(trade.type === "sell"){
						let item = Object.keys(trade.sell.item)[0];
						let price = trade.sell.price;
						let total = trade.sell.item[item];
						let sold = trade.sold;

						DiscordCards.classHandler.classes.Card.getAll().then((cards) => {
							DiscordCards.classHandler.classes.Series.getAll().then((series) => {
								y = {};
								cards.map((a) => {
									y[a.id] = a;
								});
								series.map((a) => {
									a.name += " Pack";
									y["pack"+a.id] = a;
								});
								if(amount <= 0 || amount > (total-sold)){
									amount = total-sold;
								}

								if(sold === total){
									message.channel.send(_('unknown_offer', {user:message.author.username}));
									return;
								}
								if(user.money >= amount*price){
									User.removeMoney(amount*price).then(() => {
										User.addItems(item, amount).then(() => {
											message.channel.send(_('gm_execute', {
												user: message.author.username,
												id: id,
												item: `\`${amount}x\` ${y[item].name}`,
												amount: price.formatNumber()
											}));
											
											Offer.addSold(amount).then(() => {
												trade.sold += amount;
												let NewUser = new DiscordCards.classHandler.classes.User({id:trade.from});
												NewUser.get().then(nuser => {
													if(!nuser.settings.notifs) return;
													DiscordCards.fetchUser(trade.from).then((user) => {
														if(user !== null){
															if(trade.sold === total){
																user.send(DiscordCards.locale.render(nuser.settings.locale || 'en-US', 'offer_notif_finished', {id:id,user:message.author.username}));
															}else{
																user.send(DiscordCards.locale.render(nuser.settings.locale || 'en-US', 'offer_notif_updated', {id:id,user:message.author.username,amount:`\`${amount}x\` ${y[item].name}`}));
															}
														}
													}).catch((e) => {Common.sendError(message, e); });
												}).catch((e) => {Common.sendError(message, e); });
											}).catch((e) => {Common.sendError(message, e); });

										}).catch((e) => {Common.sendError(message, e); });
									}).catch((e) => {Common.sendError(message, e); });
								}else{
									message.channel.send(_('insufficient_currency_2', {user:message.author.username}));
								}
							}).catch((e) => {Common.sendError(message, e); });
						}).catch((e) => {Common.sendError(message, e); });
					}else{
						message.channel.send(_('is_buying_offer', {user:message.author.username}));
					}
				}).catch((e) => {Common.sendError(message, e); });

			}else{
				message.channel.send(_('no_offer_id', {user:message.author.username}));
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Executes a selling offer on the global market",
	Usage: "<offer id> [amount]",
	Cooldown: 10,
	Category: "Market",
	Aliases: ["gmbuy", "gse", "soe"]
}