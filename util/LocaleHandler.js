const fs = require('fs');
const M = require('./mustache.js');

class LocaleHandler{
	constructor(path){
		this._f = [];
		this._path = path;
	}

	load(debug){
		return new Promise((resolve, reject) => {
			this._commands = [];
			try{
				let files = fs.readdirSync(this._path);
				files.map(file => {
					if(file.endsWith('.json')){
						try{
							if(debug){console.log(require.cache[require.resolve(this._path+'/'+file)])}
							delete require.cache[require.resolve(this._path+'/'+file)];
							this._f[file.slice(0, -5).replace("_", "-")] = require(this._path+'/'+file);
							this._f[file.slice(0, -5).replace("_", "-")].Name = file.slice(0, -5);
						}catch(e){
							reject(e);
						}
					}
				});
				resolve();
			}catch(e){
				reject(e);
			}
		});
	}

	get f(){
		return this._f;
	}

	get path(){
		return this._path;
	}

	createModule(locale, prefix, merging){
		let _ =  (string, params) => {
			let lobj = this._f[locale];
			let backup = this._f["en-US"];
			if(!lobj) lobj = backup;
			if(!params) params = {};
			if(!params.prefix) params.prefix = prefix;
			if(!backup[string]) throw new Error(`No string named '${string}' was found in the source translation.`);
			return M.render(lobj[string] || backup[string], params);
		}
		_.valid = string => {
			let lobj = this._f[locale];
			let backup = this._f["en-US"];
			if(!lobj) lobj = backup;
			let res = null;
			let sindex = lobj;
			let sibackup = backup;
			sindex = sindex[string];
			sibackup = sibackup[string];
			if(!sindex) sindex = sibackup;
			if(!sindex){res = false;return;}
			if(typeof sindex === "string") res = sindex;
			return res;
		}

		return _;
	}

	render(locale, string, params){
		let lobj = this._f[locale];
		let backup = this._f["en-US"];
		if(!lobj) lobj = backup;
		if(!params) params = {};
		if(!backup[string]) throw new Error(`No string named '${string}' was found in the source translation.`);
		return M.render(lobj[string] || backup[string], params);
	}
}

module.exports = LocaleHandler;