const fs = require('fs');

class CommandHandler{
	constructor(path){
		this._commands = [];
		this._path = path;
	}

	load(debug){
		return new Promise((resolve, reject) => {
			this._commands = [];
			try{
				let files = fs.readdirSync(this._path);
				files.map(file => {
					if(file.endsWith('.js')){
						try{
							if(debug){console.log(require.cache[require.resolve(this._path+'/'+file)])}
							delete require.cache[require.resolve(this._path+'/'+file)];
							this._commands[file.slice(0, -3)] = require(this._path+'/'+file);
							this._commands[file.slice(0, -3)].Name = file.slice(0, -3);
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

	get(command){
		return this._commands[command];
	}

	get commands(){
		return this._commands;
	}

	get path(){
		return this._path;
	}

	search(command){
		let cmd = this.get(command);
		if(cmd != undefined){
			cmd.RootName = command;
			return cmd;
		}else{
			let newcmd = undefined;
			Object.keys(this._commands).map((ccmdn)=>{
				let ccmd = this.get(ccmdn);
				if(ccmd.Aliases){
					if(ccmd.Aliases.includes(command)){
						ccmd.RootName = ccmdn;
						newcmd = ccmd;
					}
				}
			});
			return newcmd;
		}
		
	}

	getIndex(command){
		Object.keys(this._commands).map((cmd)=>{
			if(this._commands[cmd].Execute === command.Execute){
				return cmd;
			}
		});
		return undefined;
	}
}

module.exports = CommandHandler;