const fs = require('fs');

class Command{
	constructor(data){
		this.function = data.Execute;
		this.description = data.Description;
		this.usage = data.Usage;
		this.cooldown = data.Cooldown;
		this.extra = data.Extra;
		this.aliases = data.Aliases;
		this.metadata = data.Metadata;
	}

	get description(){
		return this.description;
	}

	get usage(){
		return this.usage;
	}

	get cooldown(){
		return this.cooldown;
	}

	get extra(){
		return this.extra;
	}

	get aliases(){
		return this.aliases;
	}

	get metadata(){
		return this.metadata;
	}

	hasAlias(command){
		if(command){
			return this.aliases.includes(command);
		}else{
			return this.aliases !== null
		}
	}

	execute(args, message){
		this.function(args, message)
	}
}

module.exports = Command;