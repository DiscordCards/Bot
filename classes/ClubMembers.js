class ClubMembers {
	constructor(obj){
		this.obj = obj;
	}

	getOwner(){
		let owner = null;
		Object.keys(this.obj).map(id => {
			if(this.obj[id] === 'owner'){
				owner = id;
			}
		})
		return owner;
	}

	isOwner(user){
		return this.getOwner() === user.id;
	}

	isAdmin(user){
		return this.getOwner() === user.id ? true : this.getAdmins().includes(user.id);
	}

	exists(user){
		return Object.keys(this.obj).includes(user.id);
	}

	getAdmins(){
		let admins = [];
		Object.keys(this.obj).map(id => {
			if(this.obj[id] === 'admin'){
				admins.push(id);
			}
		})
		return admins;
	}

	getMembers(){
		let members = [];
		Object.keys(this.obj).map(id => {
			if(this.obj[id] === 'member'){
				members.push(id);
			}
		})
		return members;
	}

	getMemberData(){
		return new Promise((resolve, reject) => {
			let pa = Object.keys(this.obj).map(u=>rdb.r.table("users").get(u).run(rdb.conn))
			Promise.all(pa).then(resolve).catch(reject)
		})
	}

	has(id){
		return Object.keys(this.obj).includes(id);
	}

	sizeIn(rank){
		let count = 0;
		Object.keys(this.obj).map(id => {
			if(this.obj[id] === rank){
				count++;
			}
		})
		return count;
	}

	get size(){
		return Object.keys(this.obj).length;
	}

	get ranks(){
		return ['owner','member','admin'];
	}
}

module.exports = ClubMembers;