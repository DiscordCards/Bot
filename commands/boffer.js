module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}
			if(Args.length >= 3){
				let item = Args.join(" ");
				let matches = item.match(/(\d+)\s(\d+)$/i);
				let amount = 1;
				let price = 1;
				if(item.match(/\s(\d+)\s(\d+)$/i)){
					item = item.replace(/\s(\d+)\s(\d+)$/, "");
					amount = Number(matches[0].split(" ")[0]);
					price = Number(matches[0].split(" ")[1]);
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

							let results = Common.qSearch(items, item);
							let found = false;
							Object.keys(y).map((a) => {
								if(item.toLowerCase() === y[a].name.toLowerCase()){
									found = true;
									let currentItem = y[a];
									if((amount*price) <= user.money){
										if(price >= 1000000){ message.reply(_('large_price')); return;};
										User.getOffers().then((offers) => {
											if(offers.length < 10){
												User.removeMoney((amount*price)).then(() => {
													let now = new Date().valueOf();
													let tID = now.toString(36);

													let tradeData = {
														id: tID,
														type: "buy",
														from: message.author.id,
														buy: {
															price: price,
															item: {}
														},
														bought: 0,
														created: now
													};

													tradeData.buy.item[a] = amount;

													DiscordCards.classHandler.classes.Market.add(tradeData).then(() => {
														message.channel.send(_('gm_buying_buy', {
															user: message.author.username,
															item: `${amount === 1 ? "" : "`"+amount+"x` "}${currentItem.name}`,
															amount: price.formatNumber(),
															id: tID
														}));
													}).catch((e) => {Common.sendError(message, e); });

												}).catch((e) => {Common.sendError(message, e); });
											}else{
												message.channel.send(_('max_offers', {user:message.author.username}));
											}
										}).catch((e) => {Common.sendError(message, e); });
									}else{
										message.channel.send(_('insufficient_currency', {user:message.author.username}));
									}
								}
							});

							if(results.length > 0 && !found){
								let itmFound = [];
								let msg = (results.length === 1 ? _('item_found') : _('items_found', {amount:results.length.formatNumber()}))+"\n"

								results.map((a) => {
									itmFound.push("``"+a.name+"``");
								});

								msg += itmFound.sort().join(", ");

								if(msg.length > 2000){
									msg = `${_('items_found', {amount:results.length.formatNumber()})} ${_('found_specific')}`;
								}

								message.channel.send(msg);
								return;
							}

							if(!found){
								message.channel.send(_('no_card_exist_found', {user:message.author.username}));
							}
						}).catch((e) => {Common.sendError(message, e);})
					}).catch((e) => {Common.sendError(message, e);})
				}else{
					message.channel.send(_('invalid_format_user', {user:message.author.username}));
				}
			}else{
				message.channel.send(_('gbbuy_bad_args', {user:message.author.username}));
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Puts a buying offer on the global market",
	Usage: "[item] [amount] [price per item]",
	Cooldown: 10,
	Category: "Market",
	Aliases: ["gbbuy"]
}