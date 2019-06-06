class User{
	constructor(user){
		this.user = user;
	}

	user(){
		return user;
	}

	ensure(){
		return new Promise((resolve, reject) => {
			if(this.user.username === undefined && this.user.discriminator === undefined){
				DiscordCards.fetchUser(this.user.id).then(user => {
					this.user = user;
					rdb.r.table("cooldowns").get(this.user.id).run(rdb.conn).then(user => {
						if(user === null){
							rdb.r.table("cooldowns").insert({id: this.user.id}).run(rdb.conn).then(() => {
								resolve({id: this.user.id});
							}).catch(reject);
						}else{
							resolve(user);
						}
					}).catch(reject);
				}).catch(reject);
			}else{
				rdb.r.table("cooldowns").get(this.user.id).run(rdb.conn).then(user => {
					if(user === null){
						rdb.r.table("cooldowns").insert({id: this.user.id}).run(rdb.conn).then(() => {
							resolve({id: this.user.id});
						}).catch(reject);
					}else{
						resolve(user);
					}
				}).catch(reject);
			}
		});
	}

	cooldowns(){
		return rdb.r.table("cooldowns").get(this.user.id).run(rdb.conn);
	}

	setCooldown(command){
		let data = {};
		data[command] = Date.now();
		return rdb.r.table("cooldowns").get(this.user.id).update(data).run(rdb.conn);
	}

	create(){
		return rdb.r.table("users").insert({
			id: this.user.id,
			discriminator: this.user.discriminator,
			avatar: this.user.avatar,
			name: this.user.username,
			inv: {},
			badges: {},
			albums: {},
			money: 1000,
			daily: {
				time: Date.now()-86400000,
				streak: 1
			},
			quest: null,
			settings: {
				displayColor: 0x7289da,
				trades: true,
				notifs: true,
				locale: null
			}
		}).run(rdb.conn);
	}

	get(){
		return rdb.r.table("users").get(this.user.id).run(rdb.conn);
	}

	setSetting(setting, value){
		let d = {}
		d[setting] = value;
		return rdb.r.table("users").get(this.user.id).update({settings: d}).run(rdb.conn);
	}

	setDaily(daily){
		return rdb.r.table("users").get(this.user.id).update({daily: {time: daily || Date.now()}}).run(rdb.conn);
	}

	setStreak(streak){
		return rdb.r.table("users").get(this.user.id).update({daily: {streak: streak}}).run(rdb.conn);
	}

	updateInfo(){
		return rdb.r.table("users").get(this.user.id).update({name: this.user.username || rdb.r.row('name'), discriminator: this.user.discriminator || rdb.r.row('discriminator'), avatar: this.user.avatar || rdb.r.row('avatar')}).run(rdb.conn);
	}

	addItems(item, amount){
		let d = {inv: {}};
		d.inv[item] = rdb.r.row("inv")(item).default(0).add(amount);
		return rdb.r.table("users").get(this.user.id).update(d).run(rdb.conn);
	}

	removeItems(item, amount){

		let a = {"inv": {}};
		a.inv[item] = null;

		return rdb.r.table("users").get(this.user.id).replace(function(user){
			return rdb.r.branch(
				user("inv")(item).le(amount),
				user.merge(a),
				user.merge({"inv": rdb.r.object(item, user("inv")(item).sub(amount))})
			)
		}).run(rdb.conn);
	}

	removeMoney(gold){
		return rdb.r.table('users').get(this.user.id).update({money: rdb.r.row('money').sub(gold)}).run(rdb.conn);
	}

	addMoney(gold){
		return rdb.r.table('users').get(this.user.id).update({money: rdb.r.row('money').add(gold)}).run(rdb.conn);
	}

	setMoney(gold){
		return rdb.r.table('users').get(this.user.id).update({money: gold}).run(rdb.conn);
	}

	removeBadge(badge){
		let d = {};
		d[badge] = rdb.r.literal();
		return rdb.r.table('users').get(this.user.id).update({badges: d}).run(rdb.conn);
	}

	addBadge(badge){
		let d = {badges: {}};
		d.badges[badge] = Date.now();
		return rdb.r.table('users').get(this.user.id).update(d).run(rdb.conn);
	}

	addAlbum(album, id){
		let d = {albums: {}};
		d.albums[album] = [id];
		return rdb.r.table('users').get(this.user.id).update(d).run(rdb.conn);
	}

	addAlbumPiece(album, id){
		let d = {albums: {}};
		d.albums[album] = rdb.r.row('albums')(album).append(id);
		return rdb.r.table('users').get(this.user.id).update(d).run(rdb.conn);
	}

	requestTrade(id){
		return rdb.r.table('trades').insert({
			trader: this.user.id,
			tradee: id,
			trader_items: {},
			tradee_items: {},
			trader_money: 0,
			tradee_money: 0,
			accepted: false,
			ok: ""
		}).run(rdb.conn);
	}

	createClub(name){
		return DiscordCards.classHandler.classes.Club.create(this.user.id, name)
	}

	getCurrentTrade(){
		return new Promise((resolve, reject) => {
			rdb.r.table("trades").filter({ trader: this.user.id }).run(rdb.conn).then(t1 => {
				rdb.r.table("trades").filter({ tradee: this.user.id }).run(rdb.conn).then(t2 => {
					t1.toArray((err, a1) => {
						if(err){ reject(err); }
						t2.toArray((err, a2) => {
							if(err){ reject(err); }
							if(a1.length > 0){
								resolve(a1[0]);
							}else if(a2.length > 0){
								resolve(a2[0]);
							}else{
								resolve(null);
							}
						});
					});
				}).catch(reject);
			}).catch(reject);
		});
	}

	getOffers(){
		return new Promise((resolve, reject) => {
			rdb.r.table('market').filter({from: this.user.id}).run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}

	getClubs(){
		return new Promise((resolve, reject)=>{
			let id = this.user.id;
			rdb.r.table('clubs').filter(function(club){return club("members")(id).ne("owner", "member", "admin")}).run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			})
		})
	}

	setQuest(data){
		return rdb.r.table('users').get(this.user.id).update({quest: data}).run(rdb.conn);
	}
}

module.exports = User;