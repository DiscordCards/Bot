let thisClass = {
	getRarityId: function(f){
		let c = 0;
		switch(f.rarity){
			case "c":
				c = 1;
				break;
			case "uc":
				c = 2;
				break;
			case "r":
				c = 3;
				break;
			case "sr":
				c = 4;
				break;
			case "l":
				c = 5;
				break;
			default:
				console.log(f);
				break;
		}
		if(f.id.startsWith("pack")) c = 5;
		return c;
	},
	sendInv: function(message, data, _){
		let itms = [];
		let ipp = 15;

		let y = {};

		data.cards.map((c) => {
			y[c.id] = c;
		});

		let invsort = {};
		let invsel = [];

		if(Object.keys(data.user.inv).length >= 1){
			Object.keys(data.user.inv).map((a) => {

				if(data.user.inv[a] > 0 && data.user.inv[a] !== null){

					let ps = "";
					if(a.startsWith("pack") || y[a] !== undefined){
						let i = Array.pickOff(data.cards, {id: a})
						if(a.startsWith("pack")){
							let series = Array.pickOff(data.series, {id:a.slice(4)})
							ps = `~ ${data.user.inv[a].formatNumber()} x ${series.name} ${_('pack')}`;
							//itms.push(ps);
							invsort[a] = ps;
							invsel.push({id:a});
						}else{
							ps = `- ${data.user.inv[a].formatNumber()} x ${i.name} - ${_(i.rarity)}`;
							//itms.push(ps);
							invsort[a] = ps;
							invsel.push(i);
						}
					}
				}
			});
		}else{
			itms.push(`= ${_('none')}`);
		}

		invsel = invsel.sort(function(a, b){return thisClass.getRarityId(a) - thisClass.getRarityId(b)}).reverse();

		if(itms.length === 0){
			invsel.map(i => {
				if(invsort[i.id]) itms.push(invsort[i.id]);
			});
		}

		let sets = {};
		let set = [];
		let setCounter = 0;

		itms.map((a, b) => {
			set.push(a);
			if((b+1) % ipp == 0 || (b+1) >= itms.length){
				setCounter++;
				sets['set'+setCounter] = set;
				set = [];
			}
		});

		if(data.p > Object.keys(sets).length){
			data.p = Object.keys(sets).length;
		}

		let head = `! ===== [${_('inventory_list', {user:data.username})} (${_('page')} ${data.p.formatNumber()}/${Math.ceil(Object.keys(sets).length).formatNumber()})] ===== !`;
		let msg = "```diff\n"+head+"\n";

		if(Object.keys(sets).length === 0){
			msg += `= ${_('none')}`
		}else{
			msg += sets['set'+data.p].join("\n");
		}

		msg+= "\n"+head+"```";
		return msg;
	}
}

module.exports = {
	Execute: (Args, message, _, serverdata) => {
		let usr = message.author;
		let data = {};
		let p = 1;
		let ipp = 15;

		if(message.mentions.users.size >= 1){
			usr = message.mentions.users.array()[0];
			if(usr.id === DiscordCards.user.id){
				if(message.mentions.users.size >= 2){
					usr = message.mentions.users.array()[1];
				}else{
					usr = message.author;
				}
			}
		}
		let User = new DiscordCards.classHandler.classes.User(usr);
		User.get().then(user => {
			DiscordCards.classHandler.classes.Card.getAll().then((cards) => {
				DiscordCards.classHandler.classes.Series.getAll().then((series) => {
					if(user === null){
						if(usr.id === message.author.id){
							message.channel.send(_('no_start'));
						}else{
							message.channel.send(_('no_start_that', {user:message.author.username}));
						}
						return;

					}
					data.user = user;
					if(Args.length >= 1){
						if(Number(Args[0])){
							p = Number(Args[0]);

							if(p < 1){
								p = 1;
							}

							if(p > Math.ceil(Object.keys(user.inv).length/ipp)){
								p = Math.ceil(Object.keys(user.inv).length/ipp);
							}
						}
						if(Args.length >= 2){
							if(Number(Args[1])){
								p = Number(Args[1]);

								if(p < 1){
									p = 1;
								}

								if(p > Math.ceil(Object.keys(user.inv).length/ipp)){
									p = Math.ceil(Object.keys(user.inv).length/ipp);
								}
							}
						}
					}

					data.p = p;

					if(usr.id === message.author.id){
						data.username = message.author.username;
						data.userid = message.author.id;
					}else{
						if(message.mentions.users.size >= 1){
							data.username = message.mentions.users.array()[0].username;
							data.userid = message.mentions.users.array()[0].id;
							if(message.mentions.users.array()[0].id === DiscordCards.user.id){
								if(message.mentions.users.size >= 2){
									data.username = message.mentions.users.array()[1].username;
									data.userid = message.mentions.users.array()[1].id;
								}
							}
						}
					}

					data.cards = cards;
					data.series = series;
					let msg = thisClass.sendInv(message, data, _);
					message.channel.send(msg).then(m=>{
						if(Object.keys(user.inv).length === 0) return;
						if(Math.ceil(Object.keys(user.inv).length/ipp) === 1) return;
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
								if(r.emoji.name === "◀") data.p--;
								if(r.emoji.name === "▶") data.p++;
								if(data.p < 1){
									data.p = 1;
								}

								if(data.p > Math.ceil(Object.keys(user.inv).length/ipp)){
									data.p = Math.ceil(Object.keys(user.inv).length/ipp);
								}
								msg = thisClass.sendInv(message, data, _);
								r.remove(message.author);
								m.edit(msg);
							});
						}
					});
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Get your own inventory (or someone elses)",
	Usage: "<@mention> <page>",
	Cooldown: 3,
	Category: "Stats"
}