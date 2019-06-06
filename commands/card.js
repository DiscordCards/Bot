module.exports = {
	Execute: (Args, message, _) => {
		if(Args.length >= 1){
			let item = Args.join(" ");

			DiscordCards.classHandler.classes.Card.getAll().then((items) => {

				DiscordCards.classHandler.classes.Series.getAll().then((series) => {
					let y = {};
					items.map((a) => {
						y[a.id] = a;
					});
					let isId = item.startsWith("#");
					let results = isId ? items.filter(i=>i.id===item.slice(1)) : Common.qSearch(items, item);
					let found = false;
					Object.keys(y).map((a) => {
						if(item.toLowerCase() === y[a].name.toLowerCase() || (isId && item.slice(1) === y[a].id)){
							found = true;

							let currentItem = y[a];
							let embedPerms = false;
							let filePerms = false;
							let seriesName = currentItem.series ? series.filter(s=>s.id===currentItem.series)[0].name : null;
							let cache = new Date().valueOf().toString(36);
							let fields = currentItem.series ?  [{ name: _('series'), value: `${seriesName}, ${_('series')} #${currentItem.series}`, inline: true }] : [];

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
							let rarityName = "Common"

							let rarityColor = 0x7289da;

							switch(currentItem.rarity){
								case "c":
									rarityColor = 0x768ab3;
									rarityName = _('c');
									fields.push({ name: _('rarity'), value: _('c'), inline: true });
									break;
								case "uc":
									rarityName = _('uc');
									rarityColor = 0x97c15f;
									fields.push({ name: _('rarity'), value: _('uc'), inline: true });
									break;
								case "r":
									rarityName = _('r');
									rarityColor = 0xd0c653;
									fields.push({ name: _('rarity'), value: _('r'), inline: true });
									break;
								case "sr":
									rarityName = _('sr');
									rarityColor = 0xc75950;
									fields.push({ name: _('rarity'), value: _('sr'), inline: true });
									break;
								case "l":
									rarityName = _('l');
									rarityColor = 0xff8602;
									fields.push({ name: _('rarity'), value: _('l'), inline: true });
									break;
							}

							let User = new DiscordCards.classHandler.classes.User(message.author);
							let Card = new DiscordCards.classHandler.classes.Card(currentItem.id);
							User.get().then(user => {
								Card.getMarketData().then(mdata => {
									msg = `**\`#${currentItem.id}\` **-** ${currentItem.name}**\n----------------------------------------------\n`;
									msg += `***${_('rarity')}*** - ${rarityName}\n`;
									if(currentItem.series) msg += `***${_('series')}*** - ${seriesName ? `${seriesName}, ${_('series')} #${currentItem.series}` : _('limited')}\n`;;
									if(user !== null){
										msg += `***${_('owned')}*** - ${isNaN(parseInt(user.inv[a])) ? 0 : user.inv[a]}\n`;
										fields.push({name: _('owned'), value: `${isNaN(parseInt(user.inv[a])) ? 0 : user.inv[a]}`});
									}
									if(mdata.sell.count !== 0){
										msg += `***${_('sell_ap')}*** - ${mdata.sell.avg} :dollar:\n`;
										msg += `***${_('sell_low')}*** - ${mdata.sell.low} :dollar:\n`;
										msg += `***${_('sell_offers')}*** - ${mdata.sell.count}\n`;
										fields.push({name:_('sell_md'), value: `\`${_('count')}\` ${mdata.sell.count}\n\`${_('avg')}\` ${mdata.sell.avg}\n\`${_('lowest')}\` ${mdata.sell.low}`, inline: true});
									}
									if(mdata.buy.count !== 0){
										msg += `***${_('buy_ap')}*** - ${mdata.buy.avg} :dollar:\n`;
										msg += `***${_('buy_high')}*** - ${mdata.buy.high} :dollar:\n`;
										msg += `***${_('buy_offers')}*** - ${mdata.buy.count}\n`;
										fields.push({name:_('buy_md'), value: `\`${_('count')}\` ${mdata.buy.count}\n\`${_('avg')}\` ${mdata.buy.avg}\n\`${_('highest')}\` ${mdata.buy.high}`, inline: true});
									}
									msg += "```fix\n"+_('embed_warn')+"\n```";

									if(embedPerms){

										let embed = {
											embed: {
												title: `\`#${currentItem.id}\` - ${currentItem.name}`,
												type: "rich",
												color: rarityColor,
												fields: fields,
												image: {
													url: `https://discord.cards/i/c/${currentItem.id}.png?r=${cache}`
												}
											}
										};

										message.channel.send('', embed).catch((e) => {
											Common.sendError(message, e);
										})

									}else if(filePerms){
										message.channel.startTyping();
										message.channel.send(msg, {file:{attachment:`http://discord.cards/i/c/${currentItem.id}.png?r=${cache}`, name: `${currentItem.id}.png`}})
										message.channel.stopTyping();
									}else{
										message.channel.send(msg);
									}
								}).catch((e) => {Common.sendError(message, e);});
							}).catch((e) => {Common.sendError(message, e);});
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
							message.channel.send(_('no_card_id_found', {user:message.author.username}));
						}else{
							message.channel.send(_('no_card_exist_found', {user:message.author.username}));
						}
					}
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});

		}else{
			message.channel.send(_('specify_card', {user:message.author.username}));
		}
	},
	Description: "Shows information about an card.",
	Usage: "[name]",
	Extra: {
		"_(help_extra.modifiers)": [
			"`#_(help_extra.mod_card_id)` - _(help_extra.card_card_id)"
		]
	},
	Cooldown: 2,
	Category: "Shop"
}