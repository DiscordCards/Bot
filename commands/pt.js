const request = require('superagent');
const fs = require('fs');
const path = require('path');

const writeTranslationFile = t => {
	if(t.replace("_","-") === "en-US") return Promise.resolve();
	return new Promise((resolve, reject) => {
		request.get(`${DiscordCards.Config.weblate_url}/api/translations/discord-cards/bot/${t}/file/`)
			.set("Authorization", DiscordCards.Config.weblate)
			.then(r => fs.writeFileSync(path.join(DiscordCards.locale.path, `${t}.json`), JSON.stringify(r.body, 'utf8', '    ')))
			.then(resolve)
			.catch(reject)
	});
}

module.exports = {
	Execute: (Args, message) => {
		if(message.author.id === DiscordCards.Config.owner || DiscordCards.Config.devs.includes(message.author.id)){
			let oldfiles = DiscordCards.locale.f;
			let oldlocales = [];
			Object.keyValueForEach(oldfiles, (file, locale) => {
				let num = ((Object.keys(locale).length / Object.keys(oldfiles['en-US']).length) * 100).toFixed(2);
				if (num >= 100) num = 100;
				oldlocales.push({ 
					emoji: locale._emoji ? (locale._emoji.startsWith("$") ? `:${locale._emoji.slice(1)}: ` : `:flag_${locale._emoji}: `) : "",
					file: file,
					name: locale._name,
					num: num
				});
			});
			request.get(`${DiscordCards.Config.weblate_url}/api/components/discord-cards/bot/translations/?format=json`)
				.set("Authorization", DiscordCards.Config.weblate).then(r => {
				let res = r.body.results;
				let sd = DiscordCards.staticData;
				Promise.all(res.map(t => writeTranslationFile(t.language_code))).then(() => {
					return DiscordCards.locale.load()
				}).then(() => {
					let files = DiscordCards.locale.f;
					let locales = [];
					Object.keyValueForEach(files, (file, locale) => {
						let num = ((Object.keys(locale).length / Object.keys(files['en-US']).length) * 100).toFixed(2);
						if (num >= 100) num = 100;
						locales.push({ 
							emoji: locale._emoji ? (locale._emoji.startsWith("$") ? `:${locale._emoji.slice(1)}: ` : `:flag_${locale._emoji}: `) : "",
							file: file,
							name: locale._name,
							num: num
						});
					});

					let messagearr = [];
					locales.map(l => {
						let ol = Array.pickOff(oldlocales, {file:l.file});
						if(ol && ol.num === l.num) return;
						if(!ol){
							messagearr.push(`**${l.emoji}\`${l.file}\` ${l.name} \`[${l.num}%]\` :new:**`)
						}else{
							messagearr.push(`**${l.emoji}\`${l.file}\` ${l.name} \`[${ol.num}% > ${l.num}%]\`**`)
						}
						let weblatedata = Array.pickOff(res, {language_code:l.file});
						if(weblatedata && weblatedata.last_author) messagearr.push(`   Last updated by \`${weblatedata.last_author}\``);
					});
					if(messagearr.length === 0) messagearr.push('No detected changes.');
					Common.sendStatus('translation', messagearr.join("\n"));
					message.channel.send(messagearr.join("\n"));
					DiscordCards.shard.broadcastEval("DiscordCards.locale.load()");
				}).catch(e => message.reply(`Could not write translations! \`\`\`js\n${e.stack}\n\`\`\``))
			}).catch(e => message.reply(`Could not fetch data from Weblate! \`\`\`js\n${e}\n\`\`\``))
		}
	},
	Description: "Pull changes from translations repo.",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
}