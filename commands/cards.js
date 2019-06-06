module.exports = {
	Execute: (Args, message, _, serverdata) => {

		DiscordCards.classHandler.classes.Card.getAll().then((items) => {

			DiscordCards.classHandler.classes.Series.getAll().then((series) => {
				let y = {};
				items.map((a) => {
					y[a.id] = a;
				});
				let p = 1;
				let ipp = 15;

				if(Args.length >= 1){
					if(Number(Args[0])){
						p = Number(Args[0]);
						if(p < 1){
							p = 1;
						}
						if(p > Math.ceil(Object.keys(y).length/ipp)){
							p = Math.ceil(Object.keys(y).length/ipp);
						}
					}
				}

				let itmz = [];
				let itmz2 = [];
				let i = {};
				let d = [];

				for(let x in y){
					i[x] = y[x].id;
				}

				for(let x in i){
					d.push([x, i[x]]);
				}

				let k = d.sort(function(a, b){return parseInt(a[1]) - parseInt(b[1])});

				k.map((a, b) => {
					if(y[a[0]].rarity !== "l"){
						itmz.push(`- #${y[a[0]].id} - ${y[a[0]].name} - S${y[a[0]].series} : ${series.filter(s=>s.id===y[a[0]].series)[0].name} - ${y[a[0]].rarity.toUpperCase()}`);
					}else{
						itmz2.push(`- #${y[a[0]].id} - ${y[a[0]].name} - ${y[a[0]].rarity.toUpperCase()}`);
					}
				});

				let sets = {};
				let set = [];
				let setCounter = 0;
				itmz2.map(c=>itmz.push(c));

				itmz.map((a, b) => {
					set.push(a);
					if((b+1) % ipp == 0 || (b+1) >= itmz.length){
						setCounter++;
						sets['set'+setCounter] = set;
						set = [];
					}
				});

				let sendList = function(pp){
					let head = `!===== [${_('cards')} (${_('page')} ${pp.formatNumber()}/${Object.keys(sets).length.formatNumber()})] =====!`;
					let list = "```diff\n"+head+"\n";
					list += sets['set'+pp].join("\n");
					list += "\n"+head+"```";
					return list;
				}
				let msg = sendList(p);

				message.channel.send(msg).then(m=>{
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

							if(p > Math.ceil(Object.keys(y).length/ipp)){
								p = Math.ceil(Object.keys(y).length/ipp);
							}
							msg = sendList(p);
							r.remove(message.author);
							m.edit(msg);
						});
					}
				});

			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Shows a list of cards",
	Usage: "[page]",
	Cooldown: 2,
	Category: "Shop"
}