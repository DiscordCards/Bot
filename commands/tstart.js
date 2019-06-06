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
					message.channel.send(_('in_trade', {user:message.author.username}));
					return;
				}

				let usr = null;
				if(message.mentions.users.size >= 1){
					usr = message.mentions.users.array()[0];
					if(usr.id === DiscordCards.user.id){
						if(message.mentions.users.size >= 2){
							usr = message.mentions.users.array()[1];
						}else{
							usr = null;
						}
					}
				}

				if(usr !== null){
					let NewUser = new DiscordCards.classHandler.classes.User(usr);
					NewUser.get().then(ouser => {
						if(ouser === null){
							message.channel.send(_('no_start_that', {user:message.author.username}));
							return;
						}
						if(ouser.settings.trades === true){
							NewUser.getCurrentTrade().then(otrade => {
								if(otrade !== null){
									message.channel.send(_('they_in_trade', {user:message.author.username}));
									return;
								}
								User.requestTrade(usr.id).then(otrade => {
									message.channel.send(`${usr}, ${_('trade_request', {user:message.author.username})}`)
								}).catch((e) => {Common.sendError(message, e);});
							}).catch((e) => {Common.sendError(message, e);});
						}else{
							message.channel.send(_('not_accepting_trades', {user:message.author.username}))
						}
					}).catch((e) => {Common.sendError(message, e);});
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Start a trade request with a person",
	Usage: "[@mention]",
	Cooldown: 10,
	Category: "Trading",
	Aliases: ["starttrade"]
}