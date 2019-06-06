module.exports = {
	Execute: (Args, message, _) => {
		let usr = message.author;
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
			if(user === null){
				if(usr.id === message.author.id){
					message.channel.send(_('no_start'));
				}else{
					message.channel.send(_('no_start_that', {user:message.author.username}));
				}
				return;
			}

			if(Object.keys(user.badges).length === 0){
				if(usr.id === message.author.id){
					message.channel.send(_('no_badges'));
				}else{
					message.channel.send(_('no_badges_they', {user:usr.username}));
				}
				return;
			}

			DiscordCards.classHandler.classes.Badge.getAll().then((badges) => {
				let embedPerms = false;

				if(message.channel.type !== "text"){
					embedPerms = true;
				}else{
					if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
						embedPerms = true;
					}
				}

				let y = user.badges;
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
				let i = {};
				let d = [];

				let embed = {
					color: user.settings.displayColor ? user.settings.displayColor : 0x7289da,
					fields: [],
					author: {
						name: _('badges_list', {user:usr.username}),
						icon_url: usr.avatarURL
					}
				}

				for(let x in y){
					i[x] = y[x];
				}

				for(let x in i){
					d.push([x, i[x]]);
				}

				let k = d.sort(function(a, b){return a[1] - b[1]});

				k.map((a, b) => {
					embed.fields.push({name:Array.pickOff(badges, {id:a[0]}).name,value:_('badge_obtained_in', {date:new Date(y[a[0]])}),inline:true});
					itmz.push(`- ${Array.pickOff(badges, {id:a[0]}).name} - ${_('badge_obtained_in', {date:new Date(y[a[0]])})}`);
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

				let head = `!===== [${_('badges_list', {user:usr.username})} (${_('page')} ${p.formatNumber()}/${Object.keys(sets).length.formatNumber()})] =====!`;
				embed.author.name = `${_('badges_list', {user:usr.username})} (${_('page')} ${p.formatNumber()}/${Object.keys(sets).length.formatNumber()}`;
				let msg = "```diff\n"+head+"\n";

				if(Object.keys(sets).length === 0){
					msg += `= ${_('none')}`
				}else{
					msg += sets['set'+p].join("\n");
				}

				msg += "\n"+head+"```";
				if(embedPerms){
					message.channel.send(msg);
				}else{
					message.channel.send(msg);
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Get your badges (or someone elses)",
	Usage: "",
	Cooldown: 2,
	Category: "Stats",
	Aliases: ["mybadges"]
}