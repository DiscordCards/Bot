module.exports = {
	Execute: (Args, message, _) => {
		if(Args.length >= 1){
			let User = new DiscordCards.classHandler.classes.User(message.author);
			User.get().then(user => {
				if(user === null){
					message.channel.send(_('no_start'));
					return;
				}
				let item = Args.join(" ");
				let matches = item.match(/\s\d+$/i);
				let amount = 1;

				if(matches){
					if(Number(matches[0].slice(1))){
						amount = Number(matches[0].slice(1));
						item = item.replace(/\s\d+$/, "");
					}
				}
				DiscordCards.classHandler.classes.Series.getAll().then((series) => {
					let y = {};
					series.map((a) => {
						y[a.id] = a;
					});
					let isId = item.startsWith("#");
					let results = isId ? series.filter(i=>i.id===item.slice(1)) : Common.qSearch(series, item);
					let found = false;
					Object.keys(y).map((a) => {
						if(item.toLowerCase() === y[a].name.toLowerCase() || (isId && item.slice(1) === y[a].id)){
							found = true;
							let currentSeries = y[a];

							let Series = new DiscordCards.classHandler.classes.Series(currentSeries.id);
							if(currentSeries.locked){
								message.channel.send(_('series_locked'));
								return;
							}
							if(user.money >= amount*currentSeries.price){
								User.removeMoney(amount*currentSeries.price).then(()=>{
									User.addItems("pack"+a, amount).then(()=>{
										message.channel.send(amount > 1 ? _('series_bought', {item:`\`${amount}x\` ${currentSeries.name}`}) : _('series_bought_a', {item:currentSeries.name}));
									});
								});
							}else{
								message.channel.send(_('cant_affort'));
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
						if(isId){
							message.channel.send(_('no_series_id_found', {user:message.author.username}));
						}else{
							message.channel.send(_('no_series_exist_found', {user:message.author.username}));
						}
					}

				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});

		}else{
			message.channel.send(_('specify_card_pack', {user:message.author.username}));
		}
	},
	Description: "Purchase a pack.",
	Usage: "[series] <amount>",
	Cooldown: 2,
	Category: "Shop",
	Extra: {
		"_(help_extra.modifiers)": [
			"`#_(help_extra.mod_series_id)` - _(help_extra.buy_series)"
		]
	}
}