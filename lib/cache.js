class Cache {
    constructor() {
        if(new.target) {
            class C extends this.constructor {}
            C.cache = {};
            C.timer = null;
            return C;
        }
    }

    static get(key) {
        if(key === undefined) {
            return this.cache;
        }
        const now_time = Math.round(new Date() / 1000);
        if(this.cache[key] && this.cache[key].time > now_time) {
            return this.cache[key].data;
        } else {
            return undefined;
        }
    }

    static set(key, data, cache_time) {
        const now_time = this.time();
        this.cache[key] = {data: data, time: cache_time + now_time};
    }

    static delete(key) {
        if(key) {
            delete this.cache[key];
        } else {
            this.cache = {};
        }
    }

    static clear(time) {
        switch(time) {
            case undefined:
                const now_time = this.time();
                for(let key in this.cache) {
                    this.cache[key].time < now_time && (delete this.cache[key]);
                }
                break;
            case 0:
                this.timer && clearInterval(this.timer);
                this.timer = null;
                break;
            default:
                this.timer && clearInterval(this.timer);
                this.timer = setInterval(() => {
                    const now_time = this.time();
                    for(let key in this.cache) {
                        this.cache[key].time < now_time && (delete this.cache[key]);
                    }
                }, time * 1000);
        }
    }

    static time() {
        return Math.round(new Date() / 1000);
    }
}

Cache.cache = {};
Cache.timer = null;

module.exports = Cache;