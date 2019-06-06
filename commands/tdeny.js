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
					Trade.remove().then(()=>{
						message.channel.send(_('denied_trade'));
					}).catch((e) => {Common.sendError(message, e);});
				}else{
					message.channel.send(_('no_trade', {user:message.author.username}));
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Declines or stops a trade.",
	Usage: "",
	Cooldown: 1,
	Category: "Trading",
	Aliases: ["denytrade", "declinetrade", "tdecline"]
}