class Card{
	constructor(id){
		this.id = id;
	}

	get(){
		return rdb.r.db("DiscordCards").table("cards").get(this.id).run(rdb.conn);
	}

	getMarketData(){
		let marketPromise = new Promise((resolve, reject) => {
			rdb.r.table('market').run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					let buytotal = 0
					let selltotal = 0
					let buycount = 0
					let sellcount = 0
					let buyhigh = 0
					let selllow = -1
					data.map(offer=>{
						if(offer.type === "sell"){
							if(offer.sell.item[this.id]){
								sellcount++;
								selltotal += offer.sell.price;
								if(offer.sell.price < selllow || selllow === -1){
									selllow = offer.sell.price;
								}
							}
						}else{
							if(offer.buy.item[this.id]){
								buycount++;
								buytotal += offer.buy.price;
								if(offer.buy.price > buyhigh){
									buyhigh = offer.buy.price;
								}
							}
						}
					});
					resolve({
						buy: {
							total: buytotal,
							avg: (buytotal / buycount).toFixed(2),
							high: buyhigh,
							count: buycount
						},
						sell: {
							total: selltotal,
							avg: (selltotal / sellcount).toFixed(2),
							low: selllow,
							count: sellcount
						}
					})
				});
			});
		});
		return new Promise((resolve, reject) => {
			Cache.wrap("DC_"+rdb.conn.db+"_card_"+this.id+"_market", function(cb) {
				marketPromise.then(data => {
					cb(null, data);
				}).catch(e=>{
					cb(true, e);
				})
			}, (err, data)=>{
				if(err){
					reject(data);
					return;
				}
				resolve(data);
			});
		});
	}

	static getAll(){
		return new Promise((resolve, reject) => {
			rdb.r.db("DiscordCards").table('cards').run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}
}

module.exports = Card;