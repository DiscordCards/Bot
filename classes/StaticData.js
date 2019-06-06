class StaticData{

	static getAllCount(){
		return new Promise((resolve, reject) => {
			Promise.all([rdb.r.db("DiscordCards").table('series').count().run(rdb.conn), rdb.r.db("DiscordCards").table('cards').count().run(rdb.conn), rdb.r.table('users').count().run(rdb.conn), rdb.r.table('trades').count().run(rdb.conn), rdb.r.table('market').count().run(rdb.conn), rdb.r.table('clubs').count().run(rdb.conn)]).then((values) => {
				resolve({
					series: values[0],
					cards: values[1],
					users: values[2],
					trades: values[3],
					market: values[4],
					clubs: values[5]
				});
			}).catch(reject);
		});
	}

	static getRatelimitQuotes(){
		return new Promise((resolve, reject) => {
			rdb.r.table("staticData").get("ratelimit_quotes").run(rdb.conn).then((data) => {
				resolve(data.value);
			}).catch(reject);
		});
	}

	static getGameStatus(){
		return new Promise((resolve, reject) => {
			rdb.r.table("staticData").get("game_status").run(rdb.conn).then((data) => {
				resolve(data.value);
			}).catch(reject);
		});
	}

	static getPageLength(){
		return new Promise((resolve, reject) => {
			rdb.r.table("staticData").get("page_length").run(rdb.conn).then((data) => {
				resolve(data.value);
			}).catch(reject);
		});
	}
}

module.exports = StaticData;