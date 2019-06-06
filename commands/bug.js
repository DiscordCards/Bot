module.exports = {
	Execute: (Args, message, _) => {
		message.reply(`${_('command_bug')} https://github.com/DiscordCards/Tracker/issues`);
	},
	Description: "Gets an link to the bug tracker.",
	Usage: "",
	Cooldown: 1,
	Category: "General",
	Aliases: ["bugs"]
}