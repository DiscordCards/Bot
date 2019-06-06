module.exports = {
	Execute: (Args, message) => {
		if(Common.checkPerm(message.author.id, message.guild)){
			if(!Args[2]) return;
			let Card = new DiscordCards.classHandler.classes.Card(Args[1]);
			Card.get().then(card=>{
				let json = {
					content: "@here",
					embeds: [{}]
				}
				switch(Args[0]){
					case "new":
						json.embeds[0].author = {name:`New Limited Card`}
						json.embeds[0].color = 0xffcc02;
						break;
					case "changed":
						json.embeds[0].author = {name:`Changed Limited Card Market Stats`}
						json.embeds[0].color = 0xff8602;
						break;
					case "runout":
						json.embeds[0].author = {name:`Original Limited Card Market Ran Out`}
						json.embeds[0].color = 0xff5502;
						break;
				}
				json.embeds[0].thumbnail = {url:`https://discord.cards/i/c/${Args[1]}.png`}
				json.embeds[0].title = `**${card.id}** - ${card.name}`;
				let Offer = new DiscordCards.classHandler.classes.Market(Args[2]);
				Offer.get().then(offer => {
					json.embeds[0].description = `\`Offer ID\`: ${offer.id}\n\`Price per Card\`: ${offer.sell.price.formatNumber()}\n\`Sold\`: ${offer.sold.formatNumber()}\n\`Left\`: ${(offer.sell.item[Object.keys(offer.sell.item)[0]]-offer.sold).formatNumber()}`;
					request.post(DiscordCards.Config.lnotif)
					.send(json)
					.end((err,res)=>{
						if(err){
							message.reply(err.toString());
							return;
						}
						message.reply(`${res.statusCode}`);
					});
				});
			});
		}
	},
	Description: "Post something to limited-notifs",
	Usage: "[type] [id] [offerid]",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
};