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
					if(!trade.accepted){
						message.channel.send(_('trade_not_accepted', {user:message.author.username}));
						return;
					}
					Trade.ok("").then(()=>{
						DiscordCards.classHandler.classes.Card.getAll().then((items) => {
							DiscordCards.classHandler.classes.Series.getAll().then((series) => {
								let item = Args.join(" ");
								let matches = item.match(/\s\d+$/i);
								let amount = 1;

								if(matches){
									if(Number(matches[0].slice(1))){
										amount = Number(matches[0].slice(1));
										item = item.replace(/\s\d+$/, "");
									}
								}

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
										if(trade.trader === message.author.id){
											Trade.removeTraderItems(a, amount).then(()=>{
												message.channel.send(_('trade_remove', {item:`${amount === 1 ? "" : "`"+amount+"x` "}${currentItem.name}`}));
											}).catch((e) => {Common.sendError(message, e);})
										}else{
											Trade.removeTradeeItems(a, amount).then(()=>{
												message.channel.send(_('trade_remove', {item:`${amount === 1 ? "" : "`"+amount+"x` "}${currentItem.name}`}));
											}).catch((e) => {Common.sendError(message, e);})
										}
									}
								});

								if(results.length > 0 && !found){
									let itmFound = [];
									let msg = (results.length === 1 ? _('item_found') : _('items_found', {amount:results.length.formatNumber()}))+"\n";

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
					}).catch((e) => {Common.sendError(message, e);})
				}else{
					message.channel.send(_('no_trade', {user:message.author.username}));
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Removes an item from the trade.",
	Usage: "[item] [amount]",
	Cooldown: 3,
	Category: "Trading",
	Aliases: ["removetradeitem", "traderemoveitem"]
}