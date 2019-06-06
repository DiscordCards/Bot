class Server{
	constructor(id){
		this.id = id;
	}

	create(){
		return rdb.r.table("servers").insert({id: this.id, adminrole:"Admin", react:true, locale:"en-US", prefix:DiscordCards.Config.prefix.default}).run(rdb.conn);
	}

	get(){
		return rdb.r.table("servers").get(this.id).run(rdb.conn);
	}

	getElseCreate(fake){
		return new Promise((resolve, reject) => {
			if(fake){resolve({id: this.id, adminrole:"Admin", locale:"en-US", react:true, prefix:DiscordCards.Config.prefix.default, dm:true}); return;};
			this.get().then(data=>{
				if(data === null){
					this.create().then(()=>{
						resolve({id: this.id, adminrole:"Admin", locale:"en-US", react:true, prefix:DiscordCards.Config.prefix.default});
					})
				}else{
					resolve(data);
				}
			}).catch(reject);
		});
		return rdb.r.table("servers").get(this.id).run(rdb.conn);
	}

	setPrefix(prefix){
		return rdb.r.table("servers").get(this.id).update({prefix: prefix}).run(rdb.conn);
	}

	setAdminRole(adminrole){
		return rdb.r.table("servers").get(this.id).update({adminrole: adminrole}).run(rdb.conn);
	}

	setLocale(locale){
		return rdb.r.table("servers").get(this.id).update({locale: locale}).run(rdb.conn);
	}

	setReact(react){
		return rdb.r.table("servers").get(this.id).update({react: react}).run(rdb.conn);
	}

	static getAll(){
		return new Promise((resolve, reject) => {
			rdb.r.table('servers').run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}
}

module.exports = Server;