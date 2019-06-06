let EmptyPromise = new Promise(function(resolve, reject){
	resolve()
});

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
					if(trade.ok === message.author.id){
						Trade.ok("").then(()=>{
							message.channel.send(_('trade_ok_remove'));
						}).catch((e) => {Common.sendError(message, e);});
					}else if(trade.ok === ""){
						Trade.ok(message.author.id).then(()=>{
							message.channel.send(_('trade_ok'));
						}).catch((e) => {Common.sendError(message, e);});
					}else{
						Trade.remove().then(()=>{
							if((Object.keys(trade.trader_items).length+Object.keys(trade.tradee_items).length) === 0 && trade.trader_money+trade.tradee_money === 0){
								message.channel.send(_('trade_executed'))
							}else{
								message.channel.send(_('trade_executing')).then(m=>{
									let Trader = new DiscordCards.classHandler.classes.User({id: trade.trader});
									let Tradee = new DiscordCards.classHandler.classes.User({id: trade.tradee});

									let TraderRemovePromises = Object.keys(trade.trader_items).map(i=>{
										if(isNaN(trade.trader_items[i])){
											return EmptyPromise
										}else{
											return Trader.removeItems(i, trade.trader_items[i])
										}
									});

									let TraderAddPromises = Object.keys(trade.tradee_items).map(i=>{
										if(isNaN(trade.tradee_items[i])){
											return EmptyPromise
										}else{
											return Trader.addItems(i, trade.tradee_items[i])
										}
									});

									let TradeeRemovePromises = Object.keys(trade.tradee_items).map(i=>{
										if(isNaN(trade.tradee_items[i])){
											return EmptyPromise
										}else{
											return Tradee.removeItems(i, trade.tradee_items[i])
										}
									});

									let TradeeAddPromises = Object.keys(trade.trader_items).map(i=>{
										if(isNaN(trade.trader_items[i])){
											return EmptyPromise
										}else{
											return Tradee.addItems(i, trade.trader_items[i])
										}
									});

									let MoneyPromises = [
										Trader.removeMoney(trade.trader_money),
										Tradee.removeMoney(trade.tradee_money),
										Trader.addMoney(trade.tradee_money),
										Tradee.addMoney(trade.trader_money),
									]

									Promise.all(TraderRemovePromises).then(()=>{
										Promise.all(TradeeRemovePromises).then(()=>{
											Promise.all(TraderAddPromises).then(()=>{
												Promise.all(TradeeAddPromises).then(()=>{
													Promise.all(MoneyPromises).then(()=>{
														m.edit(_('trade_executed'));
													}).catch((e) => {Common.sendError(message, e);});
												}).catch((e) => {Common.sendError(message, e);});
											}).catch((e) => {Common.sendError(message, e);});
										}).catch((e) => {Common.sendError(message, e);});
									}).catch((e) => {Common.sendError(message, e);});
								}).catch((e) => {Common.sendError(message, e);});
							}
						}).catch((e) => {Common.sendError(message, e);});
					}
				}else{
					message.channel.send(_('no_trade', {user:message.author.username}));
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Toggles accepting the current trade.",
	Usage: "",
	Cooldown: 1,
	Category: "Trading",
	Aliases: ["oktrade"]
}