const Fuse = require("fuse.js");
module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner || DiscordCards.Config.devs.includes(message.author.id)){
			let id = Args[0];
			if(message.mentions.users.size >= 1){
				id = message.mentions.users.array()[0].id;
				if(id === DiscordCards.user.id){
					if(message.mentions.users.size >= 2){
						id = message.mentions.users.array()[1].id;
					}else{
						id = Args[0];
					}
				}
			}
			let User = new DiscordCards.classHandler.classes.User({id:id});
			User.get().then(user => {
				if(user === null){
					message.channel.send(`Sorry, ${message.author.username}, but that user hasn't started yet.`);
					return;
				}
				DiscordCards.classHandler.classes.Card.getAll().then((items) => {
					DiscordCards.classHandler.classes.Series.getAll().then((series) => {
						let item = Args.slice(1).join(" ");
						let matches = item.match(/\s\d+$/i);
						let amount = 1;

						if(matches){
							if(Number(matches[0].slice(1))){
								amount = Number(matches[0].slice(1));
								item = item.replace(/\s\d+$/, "");
							}
						}

						let y = {};
						items.map((a) => {
							y[a.id] = a;
						});

						series.map((a) => {
							a.name += " Pack";
							y["pack"+a.id] = a;
						});
						let results = Common.qSearch(items, item);
						let found = false;
						Object.keys(y).map((a) => {
							if(item.toLowerCase() === y[a].name.toLowerCase()){
								found = true;
								let currentItem = y[a];
								User.addItems(a, amount).then(()=>{
									message.channel.send(`Gave user ${user.name} \`${amount}x\` ${currentItem.name}`);
								}).catch((e) => {Common.sendError(message, e);});
							}
						});

						if(results.length > 0 && !found){
							let itmFound = [];
							let msg = `Found ${results.length.formatNumber()} item${results.length>1?'s':''}.\n`;

							results.map((a) => {
								itmFound.push("``"+a.name+"``");
							});

							msg += itmFound.sort().join(", ");

							if(msg.length > 2000){
								msg = `Found ${results.length.formatNumber()} item${results.length>1?'s':''}. Please be more specific.`;
							}

							message.channel.send(msg);
							return;
						}

						if(!found){
							message.channel.send(`Sorry, ${message.author.username}, but that card doesn't exist.`);
						}
					}).catch((e) => {Common.sendError(message, e);})
				}).catch((e) => {Common.sendError(message, e);})
			}).catch((e) => {Common.sendError(message, e);});
		}
	},
	Description: "Adds items to someones stats.",
	Usage: "[@mention/id] [item] <amount>",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}