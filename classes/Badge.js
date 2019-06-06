class Badge{
	constructor(id){
		this.id = id;
	}

	get(){
		return rdb.r.db("DiscordCards").table("badges").get(this.id).run(rdb.conn);
	}

	static getAll(){
		return new Promise((resolve, reject) => {
			rdb.r.db("DiscordCards").table('badges').run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}
}

module.exports = Badge;