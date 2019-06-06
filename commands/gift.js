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
				DiscordCards.classHandler.classes.Card.getAll().then((items) => {
					DiscordCards.classHandler.classes.Series.getAll().then((series) => {
						let item = Args.slice(1).join(" ");
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
								if(user.inv[a] && user.inv[a] >= amount){
									User.removeItems(a, amount).then(()=>{
										OUser.addItems(a, amount).then(()=>{
											message.channel.send(_(amount === 1 ? 'gift_sent_a' : 'gift_sent', {item:`${amount === 1 ? "" : "`"+amount+"x` "}${currentItem.name}`,user:usr.username}));
										}).catch((e) => {Common.sendError(message, e);})
									}).catch((e) => {Common.sendError(message, e);})
								}else{
									message.channel.send(user.inv[a] === null || user.inv[a] === 0 ? _('gift_none', {amount:amount,item:currentItem.name,user:usr.username}) : _('gift_left', {amount:amount,user:usr.username,item:currentItem.name,left:amount-user.inv[a]}));
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
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Gift someone an item.",
	Usage: "[@mention] [item] [amount]",
	Cooldown: 3,
	Category: "Trading"
}