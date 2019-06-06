module.exports = {
	Execute: (Args, message, _) => {
		message.reply(`${_('command_invite')} http://invite.discord.cards`);
	},
	Description: "Gets an invite link for the bot.",
	Usage: "",
	Cooldown: 1,
	Category: "General"
}