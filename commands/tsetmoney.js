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
						if(Args.length === 0){
							if(trade.trader === message.author.id){
								Trade.setTraderMoney(0).then(()=>{
									message.channel.send(_('trade_currency_reset'));
								});
							}else{
								Trade.setTradeeMoney(0).then(()=>{
									message.channel.send(_('trade_currency_reset'));
								});
							}
						}else{
							if(isNaN(Args[0])){
								message.channel.send(_('not_a_number'));
							}else{
								if(parseInt(Args[0]) > user.money){
									message.channel.send(_('trade_cant_afford'));
								}else if(parseInt(Args[0]) <= 0){
									if(trade.trader === message.author.id){
										Trade.setTraderMoney(0).then(()=>{
											message.channel.send(_('trade_currency_reset'));
										});
									}else{
										Trade.setTradeeMoney(0).then(()=>{
											message.channel.send(_('trade_currency_reset'));
										});
									}
								}else{
									if(trade.trader === message.author.id){
										Trade.setTraderMoney(parseInt(Args[0])).then(()=>{
											message.channel.send(_('trade_currency_set', {amount:parseInt(Args[0])}));
										});
									}else{
										Trade.setTradeeMoney(parseInt(Args[0])).then(()=>{
											message.channel.send(_('trade_currency_set', {amount:parseInt(Args[0])}));
										});
									}
								}
							}
						}
						if(trade.trader === message.author.id){

						}
					}).catch((e) => {Common.sendError(message, e);})
				}else{
					message.channel.send(_('no_trade', {user:message.author.username}));
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Sets how much :dollar: you offer.",
	Usage: "[amount]",
	Cooldown: 3,
	Category: "Trading",
	Aliases: ["settrademoney", "tradesetmoney"]
}