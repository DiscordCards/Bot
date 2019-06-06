let RGB = {
	toHex: function(r, g, b) {
    	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	},
	random: function() {
    	return parseInt(this.toHex(Common.rInt(0,255),Common.rInt(0,255),Common.rInt(0,255)).slice(1), 16);
	}
}

class Club{
	constructor(id){
		this.id = id;
	}

	static banner(){
		return {
			baseNames: [
				"default",
				"inverted",
				"spiked",
				"tri"
			],
			designNames: [
				"nitro",
				"dbots",
				"discord",
				"discordalt",
				"dcards",
				"dcardsinverted"
			],
			validBaseName: function(name){
				return this.baseNames.includes(name);
			},
			validDesignName: function(name){
				return this.designNames.includes(name);
			}
		}
	}

	get members(){
		return DiscordCards.classHandler.classes.ClubMembers
	}

	static getAll(){
		return new Promise((resolve, reject) => {
			rdb.r.table('clubs').run(rdb.conn, (err, data) => {
				if(err){ reject(err); }
				data.toArray((err, data) => {
					if(err){ reject(err); }
					resolve(data);
				});
			});
		});
	}

	static create(owner, name){
		let obj = {
			id: new Date().valueOf().toString(36),
			name: name,
			desc: "",
			members: {},
			invites: [],
			bans: [],
			settings: {
				baseName: Array.random(this.banner().baseNames),
				baseColor: Array.random([0x9fade1, 0xfb4c4c, 0xfaa61a, 0xfaa6ff, 0xb94fff]),
				designName: "discord",
				designColor: 0xffffff,
				displayColor: 0x7289da,
				open: true
			},
			created: Date.now()
		}
		obj.members[owner] = 'owner';
		return rdb.r.table("clubs").insert(obj).run(rdb.conn);
	}

	static getByName(name){
		return new Promise((resolve, reject) => {
			rdb.r.table('clubs').filter(function(guild){
				return guild("name").downcase().eq(name.toLowerCase())
			}).default(null).run(rdb.conn).then((cursor) => {
				cursor.toArray().then((data) => {
					resolve(data[0]);
				}).catch((e) => {
					reject(e);
				});
			}).catch((e) => {
				reject(e);
			});
		})
	}

	static nameExists(name){
		return rdb.r.table("clubs").filter(function(guild){
			return guild("name").downcase().eq(name.toLowerCase())
		}).isEmpty().run(rdb.conn);
	}

	get(){
		return rdb.r.table("clubs").get(this.id).run(rdb.conn);
	}

	remove(){
		return rdb.r.table("clubs").get(this.id).delete().run(rdb.conn);
	}

	update(d){
		return rdb.r.table("clubs").get(this.id).update(d).run(rdb.conn);
	}

	setName(name){
		return rdb.r.table("clubs").get(this.id).update({name:name}).run(rdb.conn);
	}

	setDesc(desc){
		return rdb.r.table("clubs").get(this.id).update({desc:desc}).run(rdb.conn);
	}

	invite(user){
		return rdb.r.table('clubs').get(this.id).update({invites: rdb.r.row('invites').append(user)}).run(rdb.conn);
	}

	removeInvite(id){
		return rdb.r.table('clubs').get(this.id).update({
			invites: rdb.r.row('invites').difference([id])
		}).run(rdb.conn);
	}

	ban(user){
		return rdb.r.table('clubs').get(this.id).update({bans: rdb.r.row('bans').append(user)}).run(rdb.conn);
	}

	unban(id){
		return rdb.r.table('clubs').get(this.id).update({
			bans: rdb.r.row('bans').difference([id])
		}).run(rdb.conn);
	}

	addMember(id){
		let d = { members: {} }
		d.members[id] = 'member';
		return rdb.r.table("clubs").get(this.id).update(d).run(rdb.conn);
	}

	setRank(id, rank){
		let d = { members: {} }
		d.members[id] = rank;
		return rdb.r.table("clubs").get(this.id).update(d).run(rdb.conn);
	}

	removeMember(id){
		let d = { members: {} }
		d.members[id] = rdb.r.literal();
		return rdb.r.table("clubs").get(this.id).update(d).run(rdb.conn);
	}

	setSetting(setting, value){
		let d = {}
		d[setting] = value;
		return rdb.r.table("clubs").get(this.id).update({settings: d}).run(rdb.conn);
	}
}

module.exports = Club;