module.exports = {
	Execute: (Args, message, _) => {
		if(Args.length >= 1){
			let item = Args.join(" ").replace(/\sbadge$/g, "");

			DiscordCards.classHandler.classes.Badge.getAll().then((items) => {
				let y = {};
				items.map((a) => {
					y[a.id] = a;
				});
				let results = Common.qSearch(items, item);
				let found = false;
				Object.keys(y).map((a) => {
					if(item.toLowerCase() === y[a].name.toLowerCase()){
						found = true;

						let currentItem = y[a];
						let embedPerms = false;
						let filePerms = false;
						let cache = new Date().valueOf().toString(36);

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

						let User = new DiscordCards.classHandler.classes.User(message.author);
						User.get().then(user => {
							msg = `__**${currentItem.name} ${_('badge')}**         __\n----------------------------------------------\n`;
							msg += `***${_('description')}*** - ${currentItem.desc}\n`;
							msg += "```fix\n"+_('embed_warn')+"\n```";

							if(embedPerms){

								let embed = {
									embed: {
										title: `${currentItem.name} ${_('badge')}`,
										type: "rich",
										color: user ? (user.settings.displayColor ? user.settings.displayColor : 0x7289da) : 0x7289da,
										description: currentItem.desc,
										image: {
											url: `http://discord.cards/i/b/${currentItem.id}.png?r=${cache}`
										}
									}
								};

								message.channel.send('', embed).catch((e) => {
									Common.sendError(message, e);
								})

							}else if(filePerms){
								message.channel.startTyping();
								message.channel.send(msg, {file:{attachment:`http://discord.cards/i/b/${currentItem.id}.png?r=${cache}`, name:`${currentItem.id}.png`}});
								message.channel.stopTyping();
							}else{
								message.channel.send(msg);
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
					message.channel.send(_('no_badge_exist_found', {user:message.author.username}));
				}
			}).catch((e) => {Common.sendError(message, e);});

		}else{
			message.channel.send(_('specify_badge', {user:message.author.username}));
		}
	},
	Description: "Shows information about a badge.",
	Usage: "[name]",
	Cooldown: 5,
	Category: "Shop"
}