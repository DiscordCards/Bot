class Market {
	constructor(id){
		this._id = id;
	}

	get(){
		return rdb.r.table("market").get(this._id).run(rdb.conn);
	}

	static add(data){
		return rdb.r.table('market').insert(data).run(rdb.conn);
	}

	remove(){
		return rdb.r.table('market').get(this._id).delete().run(rdb.conn);
	}

	addSold(sold){
		return rdb.r.table('market').get(this._id).update({
			sold: rdb.r.row('sold').add(sold)
		}).run(rdb.conn);
	}

	addBought(bought){
		return rdb.r.table('market').get(this._id).update({
			bought: rdb.r.row('bought').add(bought)
		}).run(rdb.conn);
	}

	static getAllBuy(){
		return new Promise((resolve, reject) => {
			rdb.r.table('market').filter({type: "buy"}).orderBy(rdb.r.desc('created')).run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}

	static getAllSell(){
		return new Promise((resolve, reject) => {
			rdb.r.table('market').filter({type: "sell"}).orderBy(rdb.r.desc('created')).run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}
}

module.exports = Market;