const handleAlbum = (id, cardid, message, _, User, user) => {
	Promise.all([user.albums[id] ? User.addAlbumPiece(id, cardid) : User.addAlbum(id, cardid)]).then(()=>{
		User.removeItems(cardid, 1).then(()=>{
			message.channel.send(_('album_add_piece', {user:message.author.username,album:id}));
		}).catch((e) => {Common.sendError(message, e);});
	}).catch((e) => {Common.sendError(message, e);});
}

function handleErr(message, e, _) {
	message.channel.stopTyping();
	if(e.toString().includes("Request timed out")){
		message.reply(_('await_timeout'));
	}else if(e.toString().includes("Request was overwritten")){
		message.reply(_('await_overwritten'))
	}else{
		Common.sendError(message, e);
	}	
}

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
				DiscordCards.classHandler.classes.Album.getAll().then((albums) => {
					DiscordCards.classHandler.classes.Card.getAll().then((items) => {
						let y = {};
						items.map((a) => {
							y[a.id] = a;
						});
						let isId = item.startsWith("#");
						let results = isId ? items.filter(i=>i.id===item.slice(1)) : Common.qSearch(items, item);
						let found = false;
						Object.keys(y).map((a) => {
							if(item.toLowerCase() === y[a].name.toLowerCase() || (isId && item.slice(1) === y[a].id)){
								found = true;
								let currentItem = y[a];
								let availableAlbums = albums.filter(a => a.cards.includes(currentItem.id) && (!user.albums[a.id] || !(user.albums[a.id] && user.albums[a.id].includes(currentItem.id))));
								let selections = availableAlbums.map(a => a.id);
								selections.push("c");
								if(!user.inv[currentItem.id] || user.inv[currentItem.id] && user.inv[currentItem.id] === 0){
									message.channel.send(_('no_card'));
								}else if(availableAlbums.length === 0){
									message.channel.send(_('no_available_albums'));
								}else if(availableAlbums.length === 1){
									handleAlbum(availableAlbums[0].id, currentItem.id, message, _, User, user);
								}else{
									message.reply(_('album_which', {albums:availableAlbums.map(a=>`\`${a.id}\``).join(',')})).then(()=>{
										DiscordCards.awaitMessage(message, msg2 => selections.includes(msg2.content), 30000).then(msg => {
											if(msg.content === "c"){
												message.reply(_("operation_canceled"));
												return;
											}
											handleAlbum(msg.content, currentItem.id, message, _, User, user);
										}).catch(e=>handleErr(message, e, _));
									})
								}
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
							}else{
								message.channel.send(_('no_card_exist_found', {user:message.author.username}));
							}
						}

					}).catch((e) => {Common.sendError(message, e);});
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});

		}else{
			message.channel.send(_('specify_card', {user:message.author.username}));
		}
	},
	Description: "Makes a card into a piece of the album.",
	Usage: "[card name]",
	Cooldown: 2,
	Category: "Stats",
	Aliases: ["card2album", "c2a"]
}