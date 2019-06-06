module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner){
			DiscordCards.classHandler.classes.Card.getAll().then((items) => {
				DiscordCards.classHandler.classes.Series.getAll().then((series) => {
					try{
						let id = parseInt(items.filter(i=>!isNaN(parseInt(i.id))).sort(function(a, b){return a.id - b.id}).reverse()[0].id)+1;
						let name = Args.join(" ").split("|")[0].trim();
						let rarity = Args.join(" ").split("|")[1].trim();
						let serie = Args.join(" ").split("|")[2].trim();
						if(!['c','uc','r','sr','l'].includes(rarity)) return;
						message.reply(`__**Are you sure you want to generate this card?**__\nID: #${id}\nName: ${name}\nRarity: ${rarity.toUpperCase()}\nSeries: #${serie} - ${Array.pickOff(series, {id:serie}).name}\n${rarity === "l" ? "Limited detected, not including series param\n" : ""}http://discord.cards/i/c/${id}.png\n\nSay \`Ok!\` to create card.`);
						DiscordCards.awaitMessage(message, msg2 => true, 10000).then(msg2 => {
							if(msg2.content === "Ok!"){
								rdb.r.db("DiscordCards").table("cards").insert({id:id.toString(), series: (rarity === "l" ? null : serie), name:name, rarity:rarity.toLowerCase()}).run(rdb.conn).then(()=>{
									message.reply("Created card.");
								}).catch((e) => {Common.sendError(message, e);});
							}else{
								message.reply("Canceled request.");
							}
						}).catch(e=>message.reply(e.toString()))
					}catch(e){
						message.reply("Bad challenge.");
					}
				}).catch((e) => {Common.sendError(message, e);});
			}).catch((e) => {Common.sendError(message, e);});
		}
	},
	Description: "Make a card.",
	Usage: "[card name] | [card rarity] | [card series]",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}