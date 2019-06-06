module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}
			User.getOffers().then((offers) => {
				DiscordCards.classHandler.classes.Card.getAll().then((items) => {

					DiscordCards.classHandler.classes.Series.getAll().then((series) => {
						let y = {};
						items.map((a) => {
							y[a.id] = a;
						});
						series.map((a) => {
							a.name += ` ${_('pack')}`;
							y["pack"+a.id] = a;
						});
						let z = {};
						offers.map((a) => {
							z[a.id] = a;
						});
						let p = 1;
						let ipp = 15;

						if(Args.length >= 1){
							if(Number(Args[0])){
								p = Number(Args[0]);
								if(p < 1){
									p = 1;
								}
								if(p > Math.ceil(Object.keys(offers).length/ipp)){
									p = Math.ceil(Object.keys(offers).length/ipp);
								}
							}
						}

						let itmz = [];
						let i = {};
						let d = [];

						for(let x in z){
							i[x] = z[x].created;
						}

						for(let x in i){
							d.push([x, i[x]]);
						}

						let k = d.sort(function(a, b){return a[1] - b[1]});

						k.map((a, b) => {
							let c = z[a[0]];
							if(c.type === "sell"){

								let sold = c.sold;
								let item = Object.keys(c.sell.item)[0];
								let total = c.sell.item[item];

								let pre = "+";

								if(sold !== total){
									pre = '-';
								}

								itmz.push(`${pre} ${total}x ${y[item].name} (${c.sell.price.formatNumber()} ${_("_dollar")} ${_('each_lowercase')}) {ID: ${c.id}} [${sold.formatNumber()} ${_('sold_lowercase')}]`);
							}else{
								let bought = c.bought;
								let item = Object.keys(c.buy.item)[0];
								let total = c.buy.item[item];

								let pre = "+";

								if(bought !== total){
									pre = '-';
								}

								itmz.push(`${pre} ${total}x ${y[item].name} (${c.buy.price.formatNumber()} ${_("_dollar")} ${_('each_lowercase')}) {ID: ${c.id}} [${bought.formatNumber()} ${_('bought_lowercase')}]`);
							}
						});

						let sets = {};
						let set = [];
						let setCounter = 0;

						itmz.map((a, b) => {
							set.push(a);
							if((b+1) % ipp == 0 || (b+1) >= itmz.length){
								setCounter++;
								sets['set'+setCounter] = set;
								set = [];
							}
						});

						let head = `!===== [${_('offer_list', {user:message.author.username})} (${_('page')} ${p.formatNumber()}/${Object.keys(sets).length.formatNumber()})] =====!`;
						let msg = "```diff\n"+head+"\n";

						if(Object.keys(sets).length === 0){
							msg += `= ${_('none')}`
						}else{
							msg += sets['set'+p].join("\n");
						}

						msg += "\n"+head+"```";
						message.channel.send(msg);

					}).catch((e) => {Common.sendError(message, e);});
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Shows a list of your current offers",
	Usage: "[page]",
	Cooldown: 2,
	Category: "Market",
	Aliases: ["gmlist", "mo", "gml"]
}