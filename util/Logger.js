const fs = require('fs');
const path = require('path');

class Logger {
	constructor(path){
		this._path = path;
		if(!fs.existsSync(path)) fs.mkdirSync(path);
	}

	log(data, prefix=""){
		if(console !== undefined && console !== null){
			console.log(data);
		}

		var d = new Date();
		var f = `${prefix}${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
		if(!fs.existsSync(path.join(this._path, f+".log"))) fs.writeFileSync(path.join(this._path, f+".log"), "");
		fs.appendFile(path.join(this._path, f+".log"), data+"\n", 'utf8', (err) => {
			if(err){ throw err; }
		});
	}
}

module.exports = Logger;