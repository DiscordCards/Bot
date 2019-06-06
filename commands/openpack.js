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
							let filePerms = false;

							if(message.channel.type !== "text"){
								filePerms = true;
							}else{
								if(message.channel.permissionsFor(DiscordCards.user).has("ATTACH_FILES")){
									filePerms = true;
								}
							}

							found = true;
							let currentSeries = y[a];

							let Series = new DiscordCards.classHandler.classes.Series(currentSeries.id);
							Series.getCards().then((cards) => {
								let commons = cards.filter(c=>c.rarity=="c");
								let uncommons = cards.filter(c=>c.rarity=="uc");
								let rares = cards.filter(c=>c.rarity=="r");
								let superares = cards.filter(c=>c.rarity=="sr");
								let cardpack = [];
								let next = ()=>{
									chance = Common.rInt(0, 100);
									if(chance < 51){
										cardpack.push(commons[Math.floor(Math.random() * ((commons.length-1) - 0 + 1)) + 0]);
									}else if(chance < 85){
										cardpack.push(uncommons[Math.floor(Math.random() * ((uncommons.length-1) - 0 + 1)) + 0]);
									}else if(chance < 99){
										cardpack.push(rares[Math.floor(Math.random() * ((rares.length-1) - 0 + 1)) + 0]);
									}else if(chance === 100){
										cardpack.push(superares[Math.floor(Math.random() * ((superares.length-1) - 0 + 1)) + 0]);
									}
									if(cardpack.length<5) next();
								}
								next();
								let rarity = {c:_('c'),uc:_('uc'),r:_('r'),sr:_('sr')}

								let msg = `__**${_('opened_pack', {user:message.author.username,item:currentSeries.name})}**__\n\`\`\`fix\n`;
								cardpack.map(cp=>{msg+=`${rarity[cp.rarity]} ${cp.name}\n`});
								msg += "```"
								if(user.inv["pack"+currentSeries.id] && user.inv["pack"+currentSeries.id] > 0){
									User.removeItems("pack"+currentSeries.id, 1).then(()=>{
										Promise.all(cardpack.map(cp=>User.addItems(cp.id, 1))).then(()=>{
											if(filePerms){
												message.channel.send(_('pre_generation')).then(m=>{
													message.channel.startTyping();
													DiscordCards.IP.openpack(message, cardpack.map(c=>c.id)).then(buffer=>{
														message.channel.send(msg, {file:{attachment:buffer, name: "pack.png"}});
														message.channel.stopTyping();
														m.delete();
													}).catch(function (err) {
														if(e.toString().includes("Request timed out") && e.toString().includes("Request was overwritten")){
													    	message.channel.send(msg+`\n**${_('image_failed')}. \`${err.toString()}\`.`);
														}else{
															Common.sendError(message, e);
														}
													    m.delete();
													    message.channel.stopTyping();
													})
												}).catch((e) => {Common.sendError(message, e);});
											}else{
												message.channel.send(msg);
											}
										}).catch((e) => {Common.sendError(message, e);});
									}).catch((e) => {Common.sendError(message, e);});
								}else{
									message.channel.send(_('no_card_pack', {user:message.author.username}));
								}
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
	Description: "Opens a pack.",
	Usage: "[series]",
	Cooldown: 10,
	Category: "Shop",
	Extra: {
		"_(help_extra.modifiers)": [
			"`#_(help_extra.mod_series_id)` - _(help_extra.openpack_card_pack)"
		]
	}
}