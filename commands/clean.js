module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner || DiscordCards.Config.devs.includes(message.author.id)){
			message.channel.fetchMessages().then((msgs)=>{
				let bulk = msgs.filter(m=>m.author.id===DiscordCards.user.id).array();
				if(!isNaN(parseInt(Args[0]))){
					bulk.slice(0, parseInt(Args[0]));
				}
				Promise.all(bulk.map(m=>m.delete())).then(()=>{
					message.channel.send(`Found **${msgs.size}** messages, deleted **${bulk.length}**.`);
				});
			}).catch(e=>{
				let bulk = message.channel.messages.filter(m=>m.author.id===DiscordCards.user.id).array();
				if(!isNaN(parseInt(Args[0]))){
					bulk.slice(0, parseInt(Args[0]));
				}
				Promise.all(bulk.map(m=>m.delete())).then(()=>{
					message.channel.send(`**\`Could'nt fetch messages!\`**\nFound **${message.channel.messages.size}** messages, deleted **${bulk.length}**.`);
				});
			})
		}
	},
	Description: "way too many messages ok?",
	Usage: "<amount>",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}