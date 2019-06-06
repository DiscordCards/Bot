module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}
			let now = new Date();
			now.setHours(0, 0, 0, 0);
			let nowabs = new Date();
			let days = (nowabs.valueOf() - user.daily.time)/86400000;
			let last = new Date(user.daily.time);
			let lastdaycode = (last.getYear()*4)*(last.getMonth()*2)*last.getDate();
			let daycode = (now.getYear()*4)*(now.getMonth()*2)*now.getDate();
			let streak = user.daily.streak;
			streak = streak < 1 ? 1 : streak;
			//if((Date.now() - user.lastDaily) > 86400000){
			if(days > 1 && days < 2){
				streak++;
				let money = Math.floor(1000 * Math.log10(0.039*streak+1)+Common.rInt(100, 300));
				Promise.all([
					User.addMoney(money),
					User.setDaily(),
					User.setStreak(streak)
				]).then(()=>{
					message.channel.send(`${_('daily_ok', {amount:money})}\n*${_('daily_streak_up')}* \`${streak}x\``);
				}).catch((e) => {Common.sendError(message, e);});
			}else if(days > 2){
				streak = Math.floor(streak/days);
				streak = streak < 1 ? 1 : streak;
				let money = Math.floor(1000 * Math.log10(0.039*streak+1)+Common.rInt(100, 300));
				Promise.all([
					User.addMoney(money),
					User.setDaily(),
					User.setStreak(streak)
				]).then(()=>{
					message.channel.send(`${_('daily_ok', {amount:money})}\n*${Math.floor(days)-1 === 1 ? _('daily_streak_down') : _('daily_streak_down_plural', {days:Math.floor(days)-1})}* \`${streak}x\``);
				}).catch((e) => {Common.sendError(message, e);});
			}else{
				let tomorrow = new Date(new Date(Date.now()+86400000).toGMTString().replace("GMT ",""));
				tomorrow.setUTCHours(0, 0, 0, 0);
				//message.channel.send(`You already did your daily today!\nTime left: ${((86400000/1000)-Math.abs((user.lastDaily-Date.now())/1000)).timeElapsed()}\nStreak: \`${streak}x\``);
				let tstring = ((86400000/1000)-Math.abs((user.daily.time-nowabs.valueOf())/1000)).timeElapsed();
				let tm = tstring.split(' ');
				message.channel.send(`${_('daily_done')}\n${_('time_left')}: ${_('time', {days:tm[0],hours:tm[2],minutes:tm[4],seconds:tm[6]})}\n${_('streak')}: \`${streak}x\``);
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Recieve daily :dollar:.",
	Usage: "",
	Cooldown: 10,
	Category: "Shop"
}