const Discord = require("discord.js");
const Config = require(__dirname+'/config.json');

let Sharder = new Discord.ShardingManager(__dirname+'/main.js', {
	totalShards: Config.shards,
	respawn: true,	
});
let silent_process_exit = false;

Sharder.spawn(Config.shards).then(() => {
	global.ShardManager = Sharder;
});

Sharder.on("launch", (shard) => {
	console.log("[SHARD MASTER] "+shard.id+" launched");
});

Sharder.on("message", (message) => {
	if(message.to === "master"){
		switch(message.type){
			case "shutdown":
				console.log("[SHARD MASTER] Shutting down...");
				let silent_process_exit = true;
				process.exit(0);
				break;
			case "eval":
				eval(message.value);
				break;
		}
	}
});

process.on('exit', function(code) {
	console.log("[SHARD MASTER] Process is forcing a shut down! Exit code:", 0);
});
