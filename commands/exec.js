module.exports = {
	Execute: (Args, Message) => {
		if(Message.author.id === DiscordCards.Config.owner){
			Message.channel.startTyping();
			require("child_process").exec(Args.join(" "), (e, f, r)=>{
				Message.channel.stopTyping();
				if(e){
					Message.channel.send(`\`\`\`js\nExecution ${e}\`\`\``);
					return;
				}
				if(r!=''){
					Message.channel.send(`\`\`\`js\nSTDOUT Error: ${r}\`\`\``);
					return;
				}
				Message.channel.send(`\`\`\`${f}\`\`\``);
			});
		}
	},
	Description: "child_process.exec",
	Usage: "[code]",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}