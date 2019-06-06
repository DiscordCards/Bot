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

					if(trade.type === "buy"){
						let item = Object.keys(trade.buy.item)[0];
						let price = trade.buy.price;
						let total = trade.buy.item[item];
						let bought = trade.bought;

						DiscordCards.classHandler.classes.Card.getAll().then((cards) => {
							DiscordCards.classHandler.classes.Series.getAll().then((series) => {
								y = {};
								cards.map((a) => {
									y[a.id] = a;
								});
								series.map((a) => {
									a.name += ` ${_('pack')}`;
									y["pack"+a.id] = a;
								});
								if(amount <= 0 || amount > (total-bought)){
									amount = total-bought;
								}

								if(bought === total){
									message.channel.send(_('unknown_offer', {user:message.author.username}));
									return;
								}
								if(user.inv[item] >= amount){
									User.removeItems(item, amount).then(() => {
										User.addMoney(amount*price).then(() => {
											message.channel.send(_('gm_execute', {
												user: message.author.username,
												id: id,
												item: `\`${amount}x\` ${y[item].name}`,
												amount: price.formatNumber()
											}));

											Offer.addBought(amount).then(() => {
												trade.bought += amount;
												let NewUser = new DiscordCards.classHandler.classes.User({id:trade.from});
												NewUser.get().then(nuser => {
													if(!nuser.settings.notifs) return;
													DiscordCards.fetchUser(trade.from).then((user) => {
														if(user !== null){
															if(trade.bought === total){
																user.send(DiscordCards.locale.render(nuser.settings.locale || 'en-US', 'offer_notif_finished', {id:id,user:message.author.username}));
															}else{
																user.send(DiscordCards.locale.render(nuser.settings.locale || 'en-US', 'offer_notif_updated_sold', {id:id,user:message.author.username,amount:`\`${amount}x\` ${y[item].name}`}));
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
						message.channel.send(_('is_selling_offer', {user:message.author.username}));
					}
				}).catch((e) => {Common.sendError(message, e); });

			}else{
				message.channel.send(_('no_offer_id', {user:message.author.username}));
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Executes a buying offer on the global market",
	Usage: "<offer id> [amount]",
	Cooldown: 10,
	Category: "Market",
	Aliases: ["gbsell", "gbe", "boe"]
}