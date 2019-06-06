module.exports = {
	Execute: (Args, Message, _, serverdata) => {
		if(Message.author.id === DiscordCards.Config.owner){
			try{
				let start = new Date().getTime();
				let msg = "";
				if(Args[0] === "-c"){
					let code = Args.splice(1, Args.length).join(" ");
					msg += "```js\n"+code+"```\n";
					msg += "```js\n"+eval(code)+"```";
				}else{
					let code = Args.join(" ");
					msg += "```js\n"+eval(code)+"```";
				}

				let end = new Date().getTime();
				let time = end - start;

				Message.channel.send("Time taken: "+(time/1000)+" seconds\n"+msg);
			}catch(e){
				Message.channel.send("```js\n"+e+"```");
			}
		}
	},
	Description: "EXEC",
	Usage: "EXEC",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}