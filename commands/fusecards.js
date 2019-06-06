const Fuse = require("fuse.js");
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
							let embedPerms = false;
							let filePerms = false;

							if(message.channel.type !== "text"){
								embedPerms = true;
								filePerms = true;
							}else{
								if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
									embedPerms = true;
								}
								if(message.channel.permissionsFor(DiscordCards.user).has("ATTACH_FILES")){
									filePerms = true;
								}
							}

							found = true;
							let currentSeries = y[a];

							let Series = new DiscordCards.classHandler.classes.Series(currentSeries.id);
							if(user.badges[currentSeries.id]){
								message.channel.send(_('has_badge', {user:message.author.username}));
							}else{
								Series.getCards().then((cards) => {
									let badCards = cards.filter(card=>{return !(user.inv[card.id] && user.inv[card.id] > 0)});
									if(badCards.length > 0){
										message.channel.send(`${_('missing_cards')} ${badCards.map(c=>"`"+c.name+"`").sort().join(", ")}`);
									}else if(currentSeries.locked){
										message.channel.send(_('series_locked'));
									}else{
										User.addBadge(currentSeries.id).then(()=>{
											let cache = new Date().valueOf().toString(36);
											Promise.all(cards.map(c=>User.removeItems(c.id, 1))).then(()=>{
												let msg = _('earned_badge', {user:message.author.username})
												let embed = {
													embed: {
														author: {
															icon_url: message.author.avatarURL,
															name: msg
														},
														color: user.settings.displayColor ? user.settings.displayColor : 0x7289da,
														image: {
															url: `http://discord.cards/i/b/${currentSeries.id}.png?r=${cache}`
														}
													}
												};
												if(embedPerms){
													message.channel.send('', embed)
												}else if(filePerms){
													message.channel.startTyping();
													message.channel.sendFile(msg, {file:{attachment:`http://discord.cards/i/b/${currentSeries.id}.png?r=${cache}`, name:`${currentItem.id}.png`}});
													message.channel.stopTyping();
												}else{
													message.channel.send(msg);
												}
											}).catch((e) => {Common.sendError(message, e);});
										}).catch((e) => {Common.sendError(message, e);});
									}
								}).catch((e) => {Common.sendError(message, e);});
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
	Description: "Fuses all cards of one series into a badge.",
	Usage: "[series]",
	Cooldown: 2,
	Category: "Shop",
	Extra: {
		"_(help_extra.modifiers)": [
			"`#_(help_extra.mod_series_id)` - _(help_extra.fusecards_series_id)"
		]
	},
	Aliases: ["makebadge"]
}