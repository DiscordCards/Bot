module.exports = {
	Execute: (Args, message, _) => {
		message.reply(`${_('command_serverinvite')} http://join.discord.cards`);
	},
	Description: "Gets an invite link for the official server.",
	Usage: "",
	Cooldown: 1,
	Category: "General"
}