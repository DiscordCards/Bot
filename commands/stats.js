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
					if(Date.now() - usr.createdTimestamp < 86400000*7){
						message.channel.send(_('cant_start_week', {user:message.author.username}));
					}else{
						User.create().then(()=>{
							message.channel.send(_('started_acct', {user:message.author.username}));
						}).catch((e) => {Common.sendError(message, e);});
					}
				}else{
					message.channel.send(_('no_start_that', {user:message.author.username}));
				}
				return;
			}

			let embedPerms = false;

			if(message.channel.type !== "text"){
				embedPerms = true;
			}else{
				if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
					embedPerms = true;
				}
			}

			if(!embedPerms) {message.reply(_('need_embed')); return;};

			let items = 0;
			Object.keys(user.inv).map(i=>{i !== null ? items += user.inv[i] : null});

			if(user.money.toFixed(2).includes(".5")) User.addMoney(0.5);

			let embed = {
				color: user.settings.displayColor ? user.settings.displayColor : 0x7289da,
				fields: [
					{
						name: _('balance_embed'),
						value: user.money.formatNumber(),
						inline: true
					},
					{
						name: _('items'),
						value: items.formatNumber(),
						inline: true
					}
				],
				author: {
					name: _('stats_list', {user:usr.username}),
					icon_url: usr.displayAvatarURL
				}
			}

			if(Object.keys(user.badges).length > 0){
				embed.image = {url:`https://api.discord.cards/cache/badge/${Object.keys(user.badges).sort((a,b)=>user.badges[a]>user.badges[b]).join(",")}!1`}
			}

			message.channel.send("", {embed: embed});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Get your own statistics (or someone elses)",
	Usage: "<@mention>",
	Cooldown: 2,
	Category: "Stats"
}