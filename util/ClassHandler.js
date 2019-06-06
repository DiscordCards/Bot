const fs = require('fs');

class ClassHandler{
	constructor(path){
		this._classes = [];
		this._path = path;
	}

	load(debug){
		return new Promise((resolve, reject) => {
			try{
				let files = fs.readdirSync(this._path);
				files.map(file => {
					if(file.endsWith('.js')){
						try{
							if(debug){console.log(require.cache[require.resolve(this._path+'/'+file)])}
							delete require.cache[require.resolve(this._path+'/'+file)];
							this._classes[file.slice(0, -3)] = require(this._path+'/'+file);
						}catch(e){
							reject(e);
						}
					}
				});
				resolve(this._classes);
			}catch(e){
				reject(e);
			}
		});
	}

	get(command){
		return this._classes[command];
	}

	get classes(){
		return this._classes;
	}

	get path(){
		return this._path;
	}
}

module.exports = ClassHandler;