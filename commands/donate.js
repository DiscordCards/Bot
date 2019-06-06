module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
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
			if(!usr){
				message.channel.send(_('club_specify_user'));
				return;
			}
			let OUser = new DiscordCards.classHandler.classes.User(usr);
			OUser.get().then(ouser => {
				if(ouser === null){
					message.channel.send(_('no_start_that', {user:message.author.username}));
					return;
				}
				if(Args.length < 2){
					message.channel.send(_('invalid_arg'));
					return;
				}
				let amount = parseInt(Args[1]);
				if(isNaN(amount)){
					message.channel.send(_('not_a_number'));
				}else if(amount < 0){
					message.channel.send(_('invalid_amount'));
				}else{
					if(amount > user.money){
						message.channel.send(_('donation_cant_afford'));
					}else{
						User.removeMoney(amount).then(()=>{
							OUser.addMoney(amount).then(()=>{
								message.channel.send(_('donation_sent', {amount:amount,user:usr.username}));
							}).catch((e) => {Common.sendError(message, e);})
						}).catch((e) => {Common.sendError(message, e);})
					}
				}
			}).catch((e) => {Common.sendError(message, e);})
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Donate someone :dollar:.",
	Usage: "[@mention] [amount]",
	Cooldown: 3,
	Category: "Trading"
}