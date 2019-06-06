module.exports = {
	Execute: (Args, message, _) => {
		if(Args.length >= 1){
			let id = Args[0].toLowerCase();

			let Offer = new DiscordCards.classHandler.classes.Market(id);

			Offer.get().then((offer) => {
				if(offer === null){
					message.channel.send(_('unknown_offer', {user:message.author.username}));
					return;
				}

				let User = new DiscordCards.classHandler.classes.User({id:offer.from});
				User.get().then((user) => {
					DiscordCards.classHandler.classes.Card.getAll().then((cards) => {
						DiscordCards.classHandler.classes.Series.getAll().then((series) => {
							let embedPerms = false;
							let embed = {
								embed: {
									title: _("offer_info"),
									type: "rich",
									color: 0x7289da,
									fields: []
								}
							};
							let msg = `__**${_("offer_info")}**__\n`

							if(message.channel.type !== "text"){
								embedPerms = true;
							}else{
								if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
									embedPerms = true;
								}
							}
							let y = {};
							cards.map((a) => {
								y[a.id] = a;
							});
							series.map((a) => {
								a.name += " Pack";
								y["pack"+a.id] = a;
							});
							let card = y[Object.keys(offer[offer.type].item)[0]];
							msg += `**${_('type')}**: ${_(`${offer.type.toLowerCase()}_uppercase`)}\n`
							msg += `**${offer.type === "buy" ? _('buyer') : _('seller')}**: ${user.name}\n`
							msg += `**${_('created')}**: ${new Date(offer.created)}\n`
							//msg += `**Stock**: ${offer.type === "buy" ? `${offer.bought}/${offer.buy.item[Object.keys(offer.buy.item)[0]]}` : `${offer.sold}/${offer.sell.item[Object.keys(offer.sell.item)[0]]}`}\n`
							msg += `**${_('stock')}**: ${offer[offer.type].item[Object.keys(offer[offer.type].item)[0]]}\n`
							msg += `**${offer.type === "buy" ? _('amount_bought') : _('amount_sold')}**: ${offer.type === "buy" ? offer.bought.formatNumber() : offer.sold.formatNumber()}`
							msg += `**${_('item')}**: ${card.name}${!Object.keys(offer[offer.type].item)[0].startsWith("pack") ? `#${card.id} - ${card.rarity.toUpperCase()}` : ""}`
							msg += `**${_('price')}**: ${offer[offer.type].price}`

							embed.embed.fields.push({
								name: `**${_('type')}**`,
								value: _(`${offer.type.toLowerCase()}_uppercase`),
								inline: true
							});
							embed.embed.fields.push({
								name: `**${offer.type === "buy" ? _('buyer') : _('seller')}**`,
								value: `${user.name} (${user.id})`,
								inline: true
							});
							embed.embed.fields.push({
								name: `**${_('created')}**`,
								value: `${new Date(offer.created)}`,
								inline: true
							});
							embed.embed.fields.push({
								name: `**${_('stock')}**`,
								value: `${offer[offer.type].item[Object.keys(offer[offer.type].item)[0]]}`,
								inline: true
							});
							embed.embed.fields.push({
								name: `**${offer.type === "buy" ? _('amount_bought') : _('amount_sold')}**`,
								value: `${offer.type === "buy" ? offer.bought.formatNumber() : offer.sold.formatNumber()}`,
								inline: true
							});
							embed.embed.fields.push({
								name: `**${_('item')}**`,
								value: `${card.name}${!Object.keys(offer[offer.type].item)[0].startsWith("pack") ? `#${card.id} - ${card.rarity.toUpperCase()}` : ""}`,
								inline: true
							});
							embed.embed.fields.push({
								name: `**${_('price')}**`,
								value: `${offer[offer.type].price}`,
								inline: true
							});

							if(embedPerms){
								message.channel.send("", embed);
							}else{
								message.channel.send(msg);
							}
						}).catch((e) => {Common.sendError(message, e); });
					}).catch((e) => {Common.sendError(message, e); });
				}).catch((e) => {Common.sendError(message, e); });
			}).catch((e) => {Common.sendError(message, e); });
		}else{
			message.channel.send(`Please tell me the offer ID, ${message.author.username}.`);
		}
	},
	Description: "Gets offer information",
	Usage: "<offer id>",
	Cooldown: 1,
	Category: "Market",
	Aliases: ["gbinfo","offerinfo","gminfo"]
}