class Model {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
        this._db = null;
        this._init();
    }

    _init() {}

    //数据库实例
    get db() {
        if(!this._db) this._db = new (require('./db'))(this.table || this.constructor.name.toLowerCase(), this.ctx);
        return this._db;
    }
}

module.exports = Model;