const im = require('gm').subClass({
    imageMagick: true
});
const Jimp = require('jimp');
let shardid = "N/A"
let isDebug = false;
process.send({code:"ok"});

let Common = {
	rInt: function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	rBool: function(){
		return this.rInt(0,1) === 1;
	}
}

let log = (l)=>{
	process.send({code:'log',message:`[SHARD ${shardid} IMG] `+l.toString()});
	//console.log(l)
}

let rj = (m, e, r)=>{
	m.err = e.stack;
	r(m);
}

let mods = {
	start: function(msg){
		return new Promise((resolve, reject) => {
			shardid = msg.shardid;
			isDebug = msg.debug;
			msg.no_return = true;
			log(`Loaded, Debug set to ${msg.debug}`);
			resolve(msg);
		});
	},
	ping: function(msg){
		return new Promise((resolve, reject) => {
			shardid = msg.shardid;
			msg.time = Date.now();
			resolve(msg);
		});
	},
	openpack: function(msg){
		return new Promise((resolve, reject) => {
			new Jimp(1200, 700, function (err, base) {
				if (err) {rj(msg, err, reject); return;}
				Promise.all(
					msg.cards.map(img => {return Jimp.read(`https://discord.cards/i/c/${img}.png`);})
				).then(function (images) {
					let irr = images[4].clone();
					irr.rotate(40);
					let ir = images[3].clone();
					ir.rotate(20);
					let image = images[2].clone();
					let il = images[1].clone();
					il.rotate(-20);
					let ill = images[0].clone();
					ill.rotate(-40);
					base.composite(ill, 0, -20).composite(il, 200, -20).composite(irr, 500, -20).composite(ir, 400, -20).composite(image, 400, 30).resize(350, Jimp.AUTO).getBuffer(Jimp.MIME_PNG, (err, buffer) => {
						if (err) {rj(msg, err, reject); return;}
						msg.buffer = buffer.toString("base64");
						resolve(msg);
					});
				}).catch(function (err) {
					rj(msg, err, reject);
				})
			})
		});
	},
	album: function(msg){
		return new Promise((resolve, reject) => {
			Jimp.read(`https://discord.cards/i/a/${msg.album}/base.png`).then(base => {
				Promise.all(
					msg.cards.map(img => {return Jimp.read(`https://discord.cards/i/a/${msg.album}/${img}.png`);})
				).then(images => {
					images.map(i => base.composite(i, 0, 0));
					base.resize(350, Jimp.AUTO).getBuffer(Jimp.MIME_PNG, (err, buffer) => {
						if (err) {rj(msg, err, reject); return;}
						msg.buffer = buffer.toString("base64");
						resolve(msg);
					});
				}).catch(function (err) {
					rj(msg, err, reject);
				})
			}).catch(function (err) {
				rj(msg, err, reject);
			})
		});
	},
	cardguess: function(msg){
		return new Promise((resolve, reject) => {
			if(isDebug) log(`https://discord.cards/i/c/${msg.card}.png`);
			Jimp.read(`https://discord.cards/i/c/${msg.card}.png`).then(img1 => { // Use Jimp to read from a url
				if (img1.bitmap.width == 400 && img1.bitmap.height == 620) // Verify the correct dimensions before cropping
				img1.crop(27, 69, 344, 410); // Crop the card contents
				const filters = [
				{ apply: Common.rBool() ? 'desaturate' : 'saturate', params: [Common.rInt(40, 80)] },
				{ apply: 'spin', params: [Common.rInt(10, 350)] }
				];
				img1.color(filters); // Do some recolouring

				//img1.blur(Common.rInt(1, 10)).getBuffer(Jimp.MIME_PNG, (err, buffer) => {
				img1.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
					if (err) {
					    rj(msg, err, reject); return;
					}
					let img2 = im(buffer); // Read into ImageMagick for manipulation
					let horizRoll = Common.rInt(0, img1.bitmap.width),
					    vertiRoll = Common.rInt(0, img1.bitmap.height);
					img2.out('-implode').out(`-${Common.rInt(3, 10)}`);
					img2.out('-roll').out(`+${horizRoll}+${vertiRoll}`);
					img2.out('-swirl').out(`${Common.rBool() ? '+' : '-'}${Common.rInt(120, 180)}`);

					img2.setFormat('png').toBuffer(function (err, buffer) { // Export as buffer. We're done.
						if (err) {
							rj(msg, err, reject); return;
						}
						msg.buffer = buffer.toString("base64");
						resolve(msg);
					});
				});
			}).catch(e=>{rj(msg, e, reject)});
		});
	}
}

processMessage = function(msg){
	mods[msg.code](msg).then(result => {
		result.status = 'success'
		if(!result.no_return){
			process.send(result);
		}
	}).catch((result) => {
		result.status = 'fail'
		process.send(result);
	});
}

process.on("message", msg => {
	if(isDebug) console.log(msg);
	if(isDebug) log(`Caught ${JSON.stringify(msg, 'utf8', '\t')}`);
	if(mods[msg.code]){
		processMessage(msg);
	}
});

process.once('uncaughtException', (err) => {
	log("Got error "+err.stack);
	setTimeout(() => {
		process.exit(0);
	}, 2500);
});

process.on('unhandledRejection', (reason, p) => {
	log("REJECTED at "+reason.stack);
	//console.log("Unhandled Rejection at ", p, 'reason ', reason);
});