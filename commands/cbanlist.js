let trl = function(f){
	let c = 0;
	switch(f.rank){
		case "member":
			c = 1;
			break;
		case "admin":
			c = 2;
			break;
		case "owner":
			c = 3;
			break;
		default:
			console.log(f);
			break;
	}
	return c;
}

module.exports = {
	Execute: (Args, message, _, serverdata) => {
		if(Args.length >= 1){
			let c = Args.join(" ").replace(/\s\|\s/,"|").split("|");
			let cargs = c.reverse()[0].split(" ");
			let name = c.slice(c.length-1).join(" ");
			if(!Args.join(" ").match(/\s\|\s/,"|")){
				cargs = ["1"];
				name = Args.join(" ")
			}
			DiscordCards.classHandler.classes.Club.getByName(name).then((club) => {
				if(!club){
					message.channel.send(_('no_club'));
					return;
				}
				let Club = new DiscordCards.classHandler.classes.Club(club.id);
				Promise.all(club.bans.map(u=>rdb.r.table("users").get(u).run(rdb.conn))).then(members => {
					let y = members;
					let p = 1;
					let ipp = 15;

					if(cargs.length >= 1){
						if(Number(cargs[0])){
							p = Number(cargs[0]);
							if(p < 1){
								p = 1;
							}
							if(p > Math.ceil(Object.keys(y).length/ipp)){
								p = Math.ceil(Object.keys(y).length/ipp);
							}
						}
					}

					let itmz = [];
					let i = {};
					let d = [];

					for(let x in y){
						i[x] = y[x];
					}

					for(let x in i){
						d.push([x, i[x]]);
					}

					let k = d.sort(function(a, b){return a[1] - b[1]});

					k.map((a, b) => {
						if(typeof members[a[0]] === "function") return;
						ps = `- ${members[a[0]].name} - ${members[a[0]].id}`;
						itmz.push(ps);
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
					
					let sendList = function(pp){
						let head = `!===== [${_('club_header_bans', {club:club.name})} (${_('page')} ${p.formatNumber()}/${Object.keys(sets).length.formatNumber()})] =====!`;
						let list = "```diff\n"+head+"\n";
						if(Object.keys(sets).length === 0){
							list += `= ${_('none')}`
						}else{
							list += sets['set'+pp].join("\n");
						}
						list += "\n"+head+"```";
						return list;
					}
					let msg = sendList(p);

					message.channel.send(msg).then(m=>{
						if(msg.includes(`= ${_('none')}`)) return;
						if(Math.ceil(Object.keys(y).length/ipp) === 1) return;
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
		}else{
			message.channel.send(_('club_specify_name'));
		}
	},
	Description: "List club bans",
	Usage: "[name] <| [page]>",
	Cooldown: 1,
	Category: "Clubs",
	Aliases: ["cbl"]
}