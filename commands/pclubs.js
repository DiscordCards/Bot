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

			User.getClubs().then(clubs => {
				if(clubs.length === 0){
					if(usr.id === message.author.id){
					message.channel.send(_('no_clubs'));
				}else{
					message.channel.send(_('no_clubs_they', {user:usr.username}));
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

				let embed = {
					color: user.settings.displayColor ? user.settings.displayColor : 0x7289da,
					fields: [],
					author: {
						name: _('clubs_list', {user:usr.username}),
						icon_url: usr.avatarURL
					}
				}

				let cformat = clubs.map(club => {
					embed.fields.push({
						name: club.name,
						value: `${club.desc}\n\`${_('open')}\`: ${club.settings.open.toString().toUpperCase()}\n\`${_('members')}\`: ${Object.keys(club.members).length}\n\`${_('created')}\`: ${new Date(club.created)}`
					});
					return `- ${club.name} - ${Object.keys(club.members).length} ${_('members')}, ${_('open')}: ${club.settings.open.toString().toUpperCase()}`;
				});

				let head = `!===== [${_('clubs_list', {user:usr.username})}] =====!`;
				let msg = "```diff\n"+head+"\n";

				msg += cformat.join("\n");

				msg += "\n"+head+"```";
				if(embedPerms){
					message.channel.send("", {embed:embed});
				}else{
					message.channel.send(msg);
				}
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Get your clubs (or someone elses)",
	Usage: "<@mention>",
	Cooldown: 2,
	Category: "Clubs",
	Aliases: ["myclubs"]
}