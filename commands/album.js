module.exports = {
	Execute: (Args, message, _) => {
		if(Args.length >= 1){
			DiscordCards.classHandler.classes.Album.getAll().then((items) => {
				let User = new DiscordCards.classHandler.classes.User(message.author);
				User.get().then(user => {
					let found = false;
					items.map(album => {
						if(Args[0] === album.id){
							found = true;
							let filePerms = false;
							let cache = new Date().valueOf().toString(36);

							if(message.channel.type !== "text"){
								filePerms = true;
							}else{
								if(message.channel.permissionsFor(DiscordCards.user).has("ATTACH_FILES")){
									filePerms = true;
								}
							}

							let User = new DiscordCards.classHandler.classes.User(message.author);
							User.get().then(user => {
								msg = `__**${user && user.albums[album.id] && user.albums[album.id].length === album.cards.length ? album.name : "?".repeat(album.name.length)}**         __\n`;
								msg += `***${user ? `${(user.albums[album.id] ? user.albums[album.id].length : "0")}/` : ""}${album.cards.length} ${_('cards')}***`;

								if(filePerms){
									if(user && user.albums[album.id]){
										Cache.wrap(`DC_${rdb.conn.db}_album_${album.id}_${user.albums[album.id].sort().join("_")}`, function(cb) {
											if(Args[1] === "-z") console.log(`building`);
											DiscordCards.IP.album(message, album.id, user.albums[album.id]).then(data => {
												cb(null, data.toString("base64"));
											}).catch(e=>{
												cb(e);
											})
										}, (err, data)=>{
											if(err){
												Common.sendError(message, err);
												return;
											}
											message.channel.startTyping();
											message.channel.send(msg, {file:{attachment:new Buffer(data, "base64"), name:`${album.id}.png`}});
											message.channel.stopTyping();
										});
									}else{
										Cache.wrap(`DC_${rdb.conn.db}_album_${album.id}`, function(cb) {
											DiscordCards.IP.album(message, album.id, []).then(data => {
												cb(null, data.toString("base64"));
											}).catch(e=>{
												cb(e);
											})
										}, (err, data)=>{
											if(err){
												Common.sendError(message, err);
												return;
											}
											message.channel.startTyping();
											message.channel.send(msg, {file:{attachment:new Buffer(data, "base64"), name:`${album.id}.png`}});
											message.channel.stopTyping();
										});
									}
								}else{
									message.channel.send(msg);
								}
							}).catch((e) => {Common.sendError(message, e);});
						}
					});

					if(!found){
						message.channel.send(_('no_album_id_found', {user:message.author.username}));
					}
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});

		}else{
			message.channel.send(_('specify_album_id', {user:message.author.username}));
		}
	},
	Description: "Shows information about an album.",
	Usage: "[id]",
	Cooldown: 5,
	Category: "Stats"
}