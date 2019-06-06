class Series{
	constructor(id){
		this.id = id;
	}

	get(){
		return rdb.r.db("DiscordCards").table("series").get(this.id).run(rdb.conn);
	}

	getCards(){
		return new Promise((resolve, reject) => {
			rdb.r.db("DiscordCards").table("cards").filter({series: this.id}).run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}

	getCardsFromRarities(rarity){
		return rdb.r.db("DiscordCards").table("cards").filter({series: this.id, rarity: rarity}).run(rdb.conn);
	}

	static getAll(){
		return new Promise((resolve, reject) => {
			rdb.r.db("DiscordCards").table('series').run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}
}

module.exports = Series;