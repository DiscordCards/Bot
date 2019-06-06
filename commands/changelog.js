module.exports = {
	Execute: (Args, message) => {
		if(Common.checkPerm(message.author.id, message.guild)){
			let obj = {
				added: [],
				changed: [],
				deleted: []
			}
			let bits = Args.slice(1);
			bits.map(bit => {
				if(bit.startsWith("+")){
					obj.added.push("• "+bit.slice(1).replace(new RegExp("_", "g"), " "));
				}else if(bit.startsWith("-")){
					obj.removed.push("• "+bit.slice(1).replace(new RegExp("_", "g"), " "));
				}else if(bit.startsWith("~")){
					obj.changed.push("• "+bit.slice(1).replace(new RegExp("_", "g"), " "));
				}
			});
			let embed = {
				title: Args[0],
				color: 0x7289da,
				fields: [],
				author: {
					name: message.author.username,
					icon_url: message.author.avatarURL
				},
				timestamp: new Date()
			}
			if(obj.added.length != 0){
				embed.fields.push({
					name: "**Added**",
					value: obj.added.join("\n")
				});
			}
			if(obj.changed.length != 0){
				embed.fields.push({
					name: "**Changed**",
					value: obj.changed.join("\n")
				});
			}
			if(obj.deleted.length != 0){
				embed.fields.push({
					name: "**Removed**",
					value: obj.deleted.join("\n")
				});
			}
			message.guild.channels.get("275736895575687170").send("", { embed: embed });
		}
	},
	Description: "Post something to changelog",
	Usage: "",
	Cooldown: 0,
	Unlisted: true,
	Category: "Admin"
};