const Ctx = require('./ctx');

class Model extends Ctx {
    constructor(ctx, next) {
        super();
        this.ctx = ctx;
        this.next = next;
        this._db = null;
        this._connection = null;
        this._table = this.constructor.name.toLowerCase();
        this._pk = 'id';
        this._init();
    }

    _init() {}

    //数据库实例
    get db() {
        if(!this._db) this._db = new (require('./db'))(this.ctx, this.next).table(this._table);
        return this._connection ? this._db.connect(this._connection) : this._db;
    }
}

module.exports = Model;