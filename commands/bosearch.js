module.exports = {
	Execute: (Args, message, _, serverdata) => {
		if(Args.length >= 1){
			let item = Args.join(" ");

			DiscordCards.classHandler.classes.Card.getAll().then((items) => {

				DiscordCards.classHandler.classes.Series.getAll().then((series) => {
					let p = 1;
					let ipp = 15;
					let item = Args.join(' ').replace(/\s*$/, "");
					let matches = item.match(/\s\d+$/);

					if(matches){
						if(!isNaN(matches[0])){
							p = parseInt(matches[0]);
						}

						if(p <= 0){
							p = 1;
						}

						item = item.replace(/\d+$/, "").replace(/\s*$/, "");
					}
					let y = {};
					items.map((a) => {
						y[a.id] = a;
					});
					series.map((a) => {
						a.name += ` ${_('pack')}`;
						y["pack"+a.id] = a;
					});

					let isId = item.startsWith("#");
					let isRarity = item.startsWith("$");
					let isSeries = item.startsWith("%");
					let results = isId ? items.filter(i=>i.id===item.slice(1)) : (isRarity ? items.filter(i=>i.rarity===item.toLowerCase().slice(1)) : (isSeries ? items.filter(i=>i.series===item.slice(1)) : Common.qSearch(items, item)));
					let found = false;
					Object.keys(y).map((a) => {
						if(!found && (item.toLowerCase() === y[a].name.toLowerCase() || (isId && item.slice(1) === y[a].id))){
							found = true;
							DiscordCards.classHandler.classes.Market.getAllBuy().then((trades) => {
								let rows = [];

								for(let trade of trades){

									let bought = trade.bought;
									let item = Object.keys(trade.buy.item)[0];
									let total = trade.buy.item[item];

									if(bought !== total){
										if(item === a){
											rows.push(`< ${total}x ${y[item].name} (${trade.buy.price.formatNumber()} ${_("_dollar")} ${_('each_lowercase')}) {ID: ${trade.id}} [${bought.formatNumber()} ${_('bought_lowercase')}] >`);
										}
									}
								}
							
								let sets = {};
								let set = [];
								let setCounter = 0;

								rows.map((a, b) => {
									set.push(a);
									if((b+1) % ipp == 0 || (b+1) >= rows.length){
										setCounter++;
										sets['set'+setCounter] = set;
										set = [];
									}
								});

								if(p > Math.ceil(rows.length/ipp)){
									p = Math.ceil(rows.length/ipp);
								}

								if(sets["set"+p] === undefined || rows.length <= 0){
									message.channel.send(_('no_offers', {user:message.author.username}));
									return;
								}

								let sendList = function(pp){
									let head = `#===== [${_('gm_bo')} ${_('gm_based_search')} (${_('page')} ${p.formatNumber()}/${Math.ceil(rows.length/ipp).formatNumber()})] =====#`;
									let list = "```md\n"+head+"\n";
									list += sets['set'+pp].join("\n");
									list += "\n"+head+"```";
									return list;
								}
								let msg = sendList(p);

								message.channel.send(msg).then(m=>{
									if(Math.ceil(rows.length/ipp) === 1) return;
									if(message.channel.permissionsFor(DiscordCards.user).has("MANAGE_MESSAGES") && message.channel.permissionsFor(DiscordCards.user).has("ADD_REACTIONS") && serverdata.react){
										DiscordCards.startPagination(_, message, m, (e,r,q)=>{
											if(e){
												if(!e.toString().startsWith("Error: Request timed out")) m.edit(msg+`\n\`${e.toString()}\``);
												q(true).catch(e2=>{
													m.edit(msg+`\n${e.toString().startsWith("Error: Request timed out") ? "`"+e.toString()+"`\n" : ""}\`${e2.toString()}\``);
												});
												return;
											}
											if(r.emoji.name === "🛑"){
												q().catch(e=>{
													m.edit(msg+`\n\`${e.toString()}\``);
												});
												return;
											}
											if(r.emoji.name === "◀") p--;
											if(r.emoji.name === "▶") p++;
											if(p < 1){
												p = 1;
											}

											if(p > Math.ceil(rows.length/ipp)){
												p = Math.ceil(rows.length/ipp);
											}
											msg = sendList(p);
											r.remove(message.author);
											m.edit(msg);
										});
									}
								});
							}).catch((e) => {Common.sendError(message, e);});
						}else if(item.startsWith("$") && item.toLowerCase().slice(1) === y[a].rarity && !found){
							found = true;
							DiscordCards.classHandler.classes.Market.getAllBuy().then((trades) => {
								let rows = [];
								let rarityName = "unknown";

								switch(y[a].rarity){
									case "c":
										rarityName = _('c');
										break;
									case "uc":
										rarityName = _('uc');
										break;
									case "r":
										rarityName = _('r');
										break;
									case "sr":
										rarityName = _('sr');
										break;
									case "l":
										rarityName = _('l');
										break;
								}

								for(let trade of trades){

									let bought = trade.bought;
									let item = Object.keys(trade.buy.item)[0];
									let total = trade.buy.item[item];

									if(bought !== total){
										if(y[item].rarity === y[a].rarity){
											rows.push(`< ${total}x ${y[item].name} (${trade.buy.price.formatNumber()} ${_("_dollar")} ${_('each_lowercase')}) {ID: ${trade.id}} [${bought.formatNumber()} ${_('bought_lowercase')}] >`);
										}
									}
								}
							
								let sets = {};
								let set = [];
								let setCounter = 0;

								rows.map((a, b) => {
									set.push(a);
									if((b+1) % ipp == 0 || (b+1) >= rows.length){
										setCounter++;
										sets['set'+setCounter] = set;
										set = [];
									}
								});

								if(p > Math.ceil(rows.length/ipp)){
									p = Math.ceil(rows.length/ipp);
								}

								if(sets["set"+p] === undefined || rows.length <= 0){
									message.channel.send(_('no_offers', {user:message.author.username}));
									return;
								}

								let sendList = function(pp){
									let head = `#===== [${_('gm_bo')} ${_('gm_based_rarity', {rarity:rarityName})} (${_('page')} ${p.formatNumber()}/${Math.ceil(rows.length/ipp).formatNumber()})] =====#`;
									let list = "```md\n"+head+"\n";
									list += sets['set'+pp].join("\n");
									list += "\n"+head+"```";
									return list;
								}
								let msg = sendList(p);

								message.channel.send(msg).then(m=>{
									if(Math.ceil(rows.length/ipp) === 1) return;
									if(message.channel.permissionsFor(DiscordCards.user).has("MANAGE_MESSAGES") && message.channel.permissionsFor(DiscordCards.user).has("ADD_REACTIONS") && serverdata.react){
										DiscordCards.startPagination(_, message, m, (e,r,q)=>{
											if(e){
												if(!e.toString().startsWith("Error: Request timed out")) m.edit(msg+`\n\`${e.toString()}\``);
												q(true).catch(e2=>{
													m.edit(msg+`\n${e.toString().startsWith("Error: Request timed out") ? "`"+e.toString()+"`\n" : ""}\`${e2.toString()}\``);
												});
												return;
											}
											if(r.emoji.name === "🛑"){
												q().catch(e=>{
													m.edit(msg+`\n\`${e.toString()}\``);
												});
												return;
											}
											if(r.emoji.name === "◀") p--;
											if(r.emoji.name === "▶") p++;
											if(p < 1){
												p = 1;
											}

											if(p > Math.ceil(rows.length/ipp)){
												p = Math.ceil(rows.length/ipp);
											}
											msg = sendList(p);
											r.remove(message.author);
											m.edit(msg);
										});
									}
								});
							}).catch((e) => {Common.sendError(message, e);});
						}else if(item.startsWith("%") && item.toLowerCase().slice(1) === y[a].series && !found){
							found = true;
							DiscordCards.classHandler.classes.Market.getAllBuy().then((trades) => {
								let rows = [];
								let seriesName = Array.pickOff(series, {id:y[a].series}).name.replace(/\sPack$/,"");

								for(let trade of trades){

									let bought = trade.bought;
									let item = Object.keys(trade.buy.item)[0];
									let total = trade.buy.item[item];

									if(bought !== total){
										if(y[item].series === y[a].series || item.slice(4) === y[a].series){
											rows.push(`< ${total}x ${y[item].name} (${trade.buy.price.formatNumber()} ${_("_dollar")} ${_('each_lowercase')}) {ID: ${trade.id}} [${bought.formatNumber()} ${_('bought_lowercase')}] >`);
										}
									}
								}
							
								let sets = {};
								let set = [];
								let setCounter = 0;

								rows.map((a, b) => {
									set.push(a);
									if((b+1) % ipp == 0 || (b+1) >= rows.length){
										setCounter++;
										sets['set'+setCounter] = set;
										set = [];
									}
								});

								if(p > Math.ceil(rows.length/ipp)){
									p = Math.ceil(rows.length/ipp);
								}

								if(sets["set"+p] === undefined || rows.length <= 0){
									message.channel.send(_('no_offers', {user:message.author.username}));
									return;
								}

								let sendList = function(pp){
									let head = `#===== [${_('gm_bo')} ${_('gm_based_series', {series:seriesName})} (${_('page')} ${p.formatNumber()}/${Math.ceil(rows.length/ipp).formatNumber()})] =====#`;
									let list = "```md\n"+head+"\n";
									list += sets['set'+pp].join("\n");
									list += "\n"+head+"```";
									return list;
								}
								let msg = sendList(p);

								message.channel.send(msg).then(m=>{
									if(Math.ceil(rows.length/ipp) === 1) return;
									if(message.channel.permissionsFor(DiscordCards.user).has("MANAGE_MESSAGES") && message.channel.permissionsFor(DiscordCards.user).has("ADD_REACTIONS") && serverdata.react){
										DiscordCards.startPagination(_, message, m, (e,r,q)=>{
											if(e){
												if(!e.toString().startsWith("Error: Request timed out")) m.edit(msg+`\n\`${e.toString()}\``);
												q(true).catch(e2=>{
													m.edit(msg+`\n${e.toString().startsWith("Error: Request timed out") ? "`"+e.toString()+"`\n" : ""}\`${e2.toString()}\``);
												});
												return;
											}
											if(r.emoji.name === "🛑"){
												q().catch(e=>{
													m.edit(msg+`\n\`${e.toString()}\``);
												});
												return;
											}
											if(r.emoji.name === "◀") p--;
											if(r.emoji.name === "▶") p++;
											if(p < 1){
												p = 1;
											}

											if(p > Math.ceil(rows.length/ipp)){
												p = Math.ceil(rows.length/ipp);
											}
											msg = sendList(p);
											r.remove(message.author);
											m.edit(msg);
										});
									}
								});
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
						}else if(isRarity){
							message.channel.send(_('no_rarity_found', {user:message.author.username}));
						}else if(isSeries){
							message.channel.send(_('no_series_exist_found', {user:message.author.username}));
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
	Description: "Searches for an item on buying offers.",
	Usage: "[item] [page]",
	Extra: {
		"_(help_extra.modifiers)": [
			"`#_(help_extra.mod_card_id)` - _(help_extra.search_card)",
			"`$_(help_extra.mod_rarity)` - _(help_extra.search_rarity)",
			"`%_(help_extra.mod_series)` - _(help_extra.search_series)"
		]
	},
	Cooldown: 2,
	Category: "Market",
	Aliases: ["gbsearch", "gbs", "bos"]
}