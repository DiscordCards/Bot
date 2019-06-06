const emojis = {
	"<:discordBugBounty:293236698488504320>": "Bug Bounty",
	"<:discordBoxes:293236696596611093>": "Packaging Boxes",
	"<:discordWumpusFlag:282789300138147840>": "Wumpus Flag",
	"<:discordLootbox:282795268716494848>": "Lootbox",
	"<:discordStar:275836809995485184>": "Star",
	"<:discordQuestionBox:275836809672523779>": "Question Box",
	"<:discordMushroom:275836809546694657>": "Mushroom",
	"<:discordCoin:275836809039052802>": "Coin",
	"<:discordCartridge:275836809328459786>": "Cartridge",
	"<:discordBomb:275836809055961088>": "Bomb",
};

const LW = "<:LW:293254161276076032>";
const LS = "<:LS:293254161372545034>";
const RW = "<:RW:293254161288658945>";
const RS = "<:RS:293254161565351936>";

const SCLU = "<:SCLU:293255552098893825>";
const SCRU = "<:SCRU:293255552140705793>";
const SCLD = "<:SCLD:293255552165871626>";
const SCRD = "<:SCRD:293255552249757696>";

const SF = "<:SF:293256891562196994>";
const SC = "<:SC:293256891822505984>";

const PW = "<a:PatryWump:393573470002479104>";

const shuffle = function(array) {
    let i = 0,
        j = 0,
        temp = null;

    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};

module.exports = {
	Execute: (Args, message, _) => {
		let User = new DiscordCards.classHandler.classes.User(message.author);
		User.get().then(user => {
			if(user === null){
				message.channel.send(_('no_start'));
				return;
			}

			if(Args.length >= 1){
				let embedPerms = false;
				let extEmojiPerms = false;
				if(message.channel.type !== "text"){
					embedPerms = true;
					extEmojiPerms = true;
				}else{
					if(message.channel.permissionsFor(DiscordCards.user).has("EMBED_LINKS")){
						embedPerms = true;
					}
					if(message.channel.permissionsFor(DiscordCards.user).has("USE_EXTERNAL_EMOJIS")){
						extEmojiPerms = true;
					}
				} 
				if(!embedPerms||!extEmojiPerms) {message.reply(_('need_embed_emojis')); return;};

				let bet = parseInt(Args[0]);
				if(bet >= 1000000){ message.reply(_('large_bet')); return; };
				if(bet < 1 || isNaN(bet)){ message.reply(_('invalid_bet')); return; };

				if(bet <= user.money){
					User.removeMoney(bet).then(()=>{
						let v = {
							a: [],
							b: [],
							c: []
						};

						[1,2,3].map(()=>{
							let a = Object.keys(emojis);
							shuffle(a);
							let b = Common.rInt(0, a.length-1)+1;
							a.unshift(a[a.length-1]);
							a.push(a[1]);
							v.a.push(a[b-1]);
							v.b.push(a[b]);
							v.c.push(a[b+1]);
						});

						let string = `*${_('slots_no_match')}*`;

						v.b.map(c=>{
							if(Array.instancesOf(v.b, c) === 2) string = `${_('slots_two_match', {slot:emojis[c]})} **+${bet*2}** :dollar:.`;
							if(Array.instancesOf(v.b, c) === 3) string = `${PW} ${_('slots_all_match', {slot:emojis[c]})} **+${bet*4}** :dollar:.`;
						})

						if(!string.startsWith("*")){
							User.addMoney(string.startsWith("Spun 2") ? bet*2 : bet*4).catch((e) => {Common.sendError(message, e);})
						}

						let desc = `${SCLU}${SC}${SC}${SC}${SCRU}`;
						desc += `\n${LW}${v.a.join("")}${RW}\n${LS}${v.b.join("")}${RS} ${string}\n${LW}${v.c.join("")}${RW}`;
						desc += `\n${SCLD}${SF}${SF}${SF}${SCRD}`;

						message.channel.send("", {
							embed: {
								color: user.settings.displayColor ? user.settings.displayColor : 0x7289da,
								description: desc
							}
						});
					}).catch((e) => {Common.sendError(message, e);});
				}else{
					message.channel.send(_('insufficient_currency', {user:message.author.username}));
				}
			}else{
				message.reply(_('specify_bet'))
			}
		}).catch((e) => {Common.sendError(message, e);});
	},
	Description: "Do slots for :dollar:.",
	Usage: "[bet]",
	Cooldown: 10,
	Category: "Minigames"
}