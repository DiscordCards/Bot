Number.prototype.formatNumber = function(){
	return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

Array.random = function(arr){
	return arr[Math.floor(Math.random() * ((arr.length-1) - 0 + 1)) + 0];
}

Array.pickOff = function(arr, e){
    let a = undefined;
    let v = Object.keys(e)[0]
    arr.map(i=>{
        if(e[v] === i[v]){
            a = i;
        }
    });
    return a;
}

Array.instancesOf = function(arr, e){
    let count = 0;
    arr.map(v=>{
        if(v === e) count++;
    });
    return count;
}

Object.keyValueForEach = function(obj, func){
    Object.keys(obj).map(o=>{
        func(o,obj[o]);
    });
}

String.prototype.timeToMs = input => {
    var result = 0;
    if(/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/i.test(input)) {
    if(input.match(/\d+d/i)) result += input.match(/\d+d/i)[0].slice(0, -1) * 86400000;
    if(input.match(/\d+h/i)) result += input.match(/\d+h/i)[0].slice(0, -1) * 3600000;
    if(input.match(/\d+m/i)) result += input.match(/\d+m/i)[0].slice(0, -1) * 60000;
    if(input.match(/\d+s/i)) result += input.match(/\d+s/i)[0].slice(0, -1) * 1000;
    }
    if(/^\d+$/.test(input)) result += input * 60000;
    if(!result) return "Invalid input!";
    return result;
}

String.prototype.timeSince = function(){
    let seconds = Math.floor((new Date() - this) / 1000);

    let interval = Math.floor(seconds/31536000);

    if(interval > 1){
        return interval + " years";
    }

    interval = Math.floor(seconds/2592000);
    if(interval > 1){
        return interval + " months";
    }

    interval = Math.floor(seconds / 86400);

    if(interval > 1){
        return interval + " days";
    }

    interval = Math.floor(seconds / 3600);
    
    if(interval > 1){
        return interval + " hours";
    }

    interval = Math.floor(seconds / 60);
    
    if(interval > 1){
        return interval + " minutes";
    }

    return Math.floor(seconds) + " seconds";
}

String.prototype.timeUntil = function(){
    let seconds = Math.floor((new Date(this) - new Date()) / 1000);

    let interval = Math.floor(seconds/31536000);

    if(interval > 1){
        return interval + " years";
    }

    interval = Math.floor(seconds/2592000);
    if(interval > 1){
        return interval + " months";
    }

    interval = Math.floor(seconds / 86400);

    if(interval > 1){
        return interval + " days";
    }

    interval = Math.floor(seconds / 3600);
    
    if(interval > 1){
        return interval + " hours";
    }

    interval = Math.floor(seconds / 60);
    
    if(interval > 1){
        return interval + " minutes";
    }

    return Math.floor(seconds) + " seconds";
}

String.prototype.capFirst = function(){
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.capAllFirst = function(){
    return this.split(" ").map(s=>s.charAt(0).toUpperCase() + s.slice(1)).join(" ").split("-").map(s=>s.charAt(0).toUpperCase() + s.slice(1)).join("-");
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

Number.prototype.timeElapsed = function(){
    var sec_num = parseInt(this, 10);
    var days = Math.floor(sec_num / 86400);
    sec_num %= 86400;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (days < 10){ days = "0"+days;}
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = days+' Days '+hours+' Hours '+minutes+' Minutes '+seconds+" seconds";
    return time;
}

Number.prototype.toNth = function() {
  switch(this.toString().split('').reverse()[0]){
        case "1":
            return this.toString()+"st"
        break;
        case "2":
            return this.toString()+"nd"
        break;
        case "3":
            return this.toString()+"rd"
        break;
        default:
            return this.toString()+"th"
        break;
  }
}