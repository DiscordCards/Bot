module.exports = {
	Execute: (Args, Message, serverdata) => {
		if(Message.author.id === DiscordCards.Config.owner){
			try{
				l = require(`../locale/${Args[0]}.json`); n = []; Object.keys(l).map(v=>{if(v==="_lowpriority") return;n.push({term:v,definition:l[v]})}); Message.channel.sendFile('', {file:{attachment:new Buffer(JSON.stringify(n, 'utf8', "\t")), name:`${Args[0]}-export-${Date.now()}.json`}});
			}catch(e){
				Message.channel.send("```js\n"+e+"```");
			}
		}
	},
	Description: "Exports locale",
	Usage: "[locale]",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}