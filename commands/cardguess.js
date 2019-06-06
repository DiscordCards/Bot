const request = require('superagent');
const Levenshtein = require("levenshtein");

function handleErr(message, e, _) {
	message.channel.stopTyping();
	if(e.toString().includes("Request timed out")){
		message.reply(_('await_timeout'));
	}else if(e.toString().includes("Request was overwritten")){
		message.reply(_('await_overwritten'))
	}else if(e.response && e.response.statusCode === 502){
		message.reply(_('request_bad_gateway'))
	}else{
		Common.sendError(message, e);
	}	
}

function isClose(guess, correct){
    return ((1 - ((Math.pow(new Levenshtein(guess, correct).distance, 1.3)) / correct.length)) > 0.6)
}

module.exports = {
	Execute: (Args, message, _) => {
		let EasyMode = ["--easy","-e"].includes(Args[0]);
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}
			DiscordCards.classHandler.classes.Card.getAll().then((cards) => {
				let extEmojiPerms = false;
				if(message.channel.type !== "text"){
					embedPerms = true;
					extEmojiPerms = true;
				}else{
					if(message.channel.permissionsFor(DiscordCards.user).has("USE_EXTERNAL_EMOJIS")){
						extEmojiPerms = true;
					}
				} 
				let whblk = extEmojiPerms ? "<:discordQuestionBox:275836809672523779>" : ":white_large_square:";
				let y = {};
				cards.map((a) => {
					y[a.id] = a;
				});
				if(EasyMode) cards = cards.filter(c => !['8','9'].includes(c.series));
				let card = cards[Math.floor(Math.random() * ((cards.length-1) - 0 + 1)) + 0];
				message.channel.startTyping();
				DiscordCards.IP.cardguess(message, card.id).then(res => {
					message.channel.send(`${message.author}, ${_('cardguess_start_1')} ${whblk}${whblk}${whblk}\n${_('cardguess_start_2')}`, {file:{attachment:res, name: "whats_this_card.png"}}).then(msg=>{
						let guesses = 3;
						let waitForGuess = ()=>DiscordCards.awaitMessage(message, () => true, 30000).then(msg2 => {
							//let closest = Common.qSearch(cards, msg2.content);
							let closest = isClose(msg2.content.toLowerCase(), card.name.toLowerCase());
							if(msg2.content.toLowerCase() === "cancel"){
								msg2.reply(_('cardguess_stop'));
								return;
							}
							let money = 50;
							if(guesses === 2) money = 25;
							if(guesses === 1) money = 5;
							if(!EasyMode) money *= 1.5;
							if(!EasyMode) money = Math.round(money);
							if(msg2.content.toLowerCase() === card.name.toLowerCase()){
								msg = _('cardguess_success');
								User.addMoney(money).then(()=>{
									msg += ` **+${money}** :dollar:`;
									msg2.reply(msg);
								}).catch((e) => {Common.sendError(message, e);});
								return;
							}
							//if(closest.length === 1 && closest[0].id === card.id){
							if(closest){
								msg = _('cardguess_success_guess', {item:card.name});
								User.addMoney(money).then(()=>{
									msg += ` **+${money}** :dollar:`;
									msg2.reply(msg);
								}).catch((e) => {Common.sendError(message, e);});
								return;
							}
							guesses--;
							let guessm = guesses == 2 ? `${whblk}${whblk}:black_large_square:` : `${whblk}:black_large_square::black_large_square:`;
							msg.edit(`${message.author}, ${_('cardguess_start_1')} ${guesses === 0 ? ":black_large_square::black_large_square::black_large_square:" : guessm}\n${_('cardguess_start_2')}`);
							if(guesses === 0){
								message.reply(_('cardguess_fail', {item:card.name}))
								return;
							}
							message.reply(_("cardguess_wrong")+" "+guessm).then(m=>{setTimeout(()=>m.delete(), 5000)});
							waitForGuess();
						}).catch(e=>handleErr(message, e, _));
						waitForGuess();
						message.channel.stopTyping();
					});
				}).catch((e) => {handleErr(message, e, _)});
			}).catch((e) => {Common.sendError(message, e);});
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Guess cards for :dollar:.",
	Usage: "[--easy]",
	Cooldown: 60,
	Category: "Minigames",
	Aliases: ["cg"]
}