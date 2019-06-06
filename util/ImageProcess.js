const EventEmitter = require('events').EventEmitter;
const child_process = require('child_process');
let IProcess = child_process.fork('./image_process.js');
let awaitedRequests = {};

class ImageProcess {
	constructor(shardid, debug){
		this.shardid = shardid;
		this.debug = debug;
		IProcess.send({code:'start', shardid:shardid, debug:debug})
	}

	forgeMessage(message, code){
		return {
			id: message.id,
			shardid: this.shardid,
			code: code
		}
	}

	send(msg){
		return new Promise((resolve, reject) => {
			if(!IProcess.connected) reject(new Error('Image process not connected.'));
			let timer = setTimeout(function() {
				delete awaitedRequests[msg.id];
				reject(new Error('Request timed out'));
			}, 30000);
			if (awaitedRequests[msg.id]) {
				awaitedRequests[msg.id].reject(new Error('Request was overwritten'));   
			}
			awaitedRequests[msg.id] = {
				resolve: function(msg2) { clearTimeout(timer); resolve(msg2); },
				reject: function(e) { clearTimeout(timer); reject(e); }
			};
			IProcess.send(msg);
			if(DiscordCards.Config.debug) console.log("Sending to image process", msg);
		});
	}

	kill(){
		IProcess.kill('SIGHUP');
	}

	ping(message, cards){
		return new Promise((resolve, reject) => {
			let msg = this.forgeMessage(message, 'ping');
			this.send(res).then(res => {
				resolve(res.time);
			}).catch(reject);
		});
	}

	openpack(message, cards){
		return new Promise((resolve, reject) => {
			let msg = this.forgeMessage(message, 'openpack');
			msg.cards = cards;
			this.send(msg).then(res => {
				resolve(new Buffer(res.buffer, 'base64'));
			}).catch(reject);
		});
	}

	album(message, id, cards){
		return new Promise((resolve, reject) => {
			let msg = this.forgeMessage(message, 'album');
			msg.cards = cards;
			msg.album = id;
			this.send(msg).then(res => {
				resolve(new Buffer(res.buffer, 'base64'));
			}).catch(reject);
		});
	}

	cardguess(message, card){
		return new Promise((resolve, reject) => {
			let msg = this.forgeMessage(message, 'cardguess');
			msg.card = card;
			this.send(msg).then(res => {
				resolve(new Buffer(res.buffer, 'base64'));
			}).catch(reject);
		});
	}

	ping(message){
		return new Promise((resolve, reject) => {
			let msg = this.forgeMessage(message, 'ping');
			this.send(res).then(res => {
				resolve(res.time);
			}).catch(reject);
		});
	}

	process(){
		return IProcess;
	}
}

IProcess.on('message', msg => {
	if(msg.code === "log"){console.log(msg.message); return;};
	if(msg.code === "ok"){
		/*IProcess.stdout.on('data', function(data) {
			console.log("coughtlog", data)
			//console.log("[SHARD "+DiscordCards.shard.id+" IMG] "+data.toString()); 
		});*/
		return;
	};
	if(DiscordCards.Config.debug) console.log("Main cought msg", msg);
	if (awaitedRequests.hasOwnProperty(msg.id)) {
		if(msg.status == 'success'){
			awaitedRequests[msg.id].resolve(msg);
		}else{
			awaitedRequests[msg.id].reject({stack:msg.err});
		}
	}
});

IProcess.on('disconnect', () => {
	console.log("[SHARD "+DiscordCards.shard.id+" IMG] Disconnected. Reconnecting...");
	IProcess = child_process.fork('./image_process.js');
	IProcess.send({code:'start', shardid:this.shardid, debug:this.debug});
});

IProcess.on('error', err => {
	console.log("[SHARD "+DiscordCards.shard.id+" IMG] ERROR GIVEN:", err);
});

module.exports = ImageProcess;