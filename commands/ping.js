module.exports = {
	Execute: (Args, message, _) => {
		let n = Date.now();
		let id = message.author.id;

		let embedPerms = false;

		if(message.channel.type !== "text"){
			embedPerms = true;
		}else{
			if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
				embedPerms = true;
			}
		}

		if(embedPerms){
			message.channel.send("", {embed:{color: 0xffed58, title:_('pong')}}).then((m) => {
				let timeNow = Date.now();
				let time = (timeNow-n)/1000;
				m.edit("", {embed:{color: 0xf7b300, title:_('pong'),description:`${_('time_taken', {seconds:time})}\n${_('msg_delay', {seconds:DiscordCards.ping/1000})}`}});
			});
		}else{
			message.channel.send(_('pong')).then((m) => {
				let timeNow = Date.now();
				let time = (timeNow-n)/1000;
				m.edit(`${_('pong')}\n${_('time_taken', {seconds:time})}\n${_('msg_delay', {seconds:DiscordCards.ping/1000})}`);
			});
		}
	},
	Description: "Pong!",
	Usage: "",
	Cooldown: 1,
	Category: "General"
}