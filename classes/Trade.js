class Trade {
	constructor(id){
		this.id = id;
	}

	get(){
		return rdb.r.table("trades").get(this.id).run(rdb.conn);
	}

	remove(){
		return rdb.r.table("trades").get(this.id).delete().run(rdb.conn);
	}

	accept(){
		return rdb.r.table("trades").get(this.id).update({accepted: true}).run(rdb.conn);
	}

	unaccept(){
		return rdb.r.table("trades").get(this.id).update({accepted: false}).run(rdb.conn);
	}

	ok(id){
		return rdb.r.table("trades").get(this.id).update({ok: id}).run(rdb.conn);
	}

	addTraderItems(item, amount){
		let d = {trader_items: {}};
		d.trader_items[item] = rdb.r.row("trader_items")(item).default(0).add(amount);
		return rdb.r.table("trades").get(this.id).update(d).run(rdb.conn);
	}

	removeTraderItems(item, amount){

		let a = {"trader_items": {}};
		a.trader_items[item] = null;

		return rdb.r.table("trades").get(this.id).replace(function(user){
			return rdb.r.branch(
				user("trader_items")(item).le(amount),
				user.merge(a),
				user.merge({"trader_items": rdb.r.object(item, user("trader_items")(item).sub(amount))})
			)
		}).run(rdb.conn);
	}

	addTradeeItems(item, amount){
		let d = {tradee_items: {}};
		d.tradee_items[item] = rdb.r.row("tradee_items")(item).default(0).add(amount);
		return rdb.r.table("trades").get(this.id).update(d).run(rdb.conn);
	}

	removeTradeeItems(item, amount){

		let a = {"tradee_items": {}};
		a.tradee_items[item] = null;

		return rdb.r.table("trades").get(this.id).replace(function(user){
			return rdb.r.branch(
				user("tradee_items")(item).le(amount),
				user.merge(a),
				user.merge({"tradee_items": rdb.r.object(item, user("tradee_items")(item).sub(amount))})
			)
		}).run(rdb.conn);
	}

	setTraderMoney(gold){
		return rdb.r.table('trades').get(this.id).update({trader_money: gold}).run(rdb.conn);
	}

	setTradeeMoney(gold){
		return rdb.r.table('trades').get(this.id).update({tradee_money: gold}).run(rdb.conn);
	}

	static getAll(){
		return new Promise((resolve, reject) => {
			rdb.r.table('trades').run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}
}

module.exports = Trade;