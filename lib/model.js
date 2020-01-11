const Context = require('./context');

class Model extends Context {
    constructor(ctx) {
        super(ctx);
        this._db = null;
        this._connection = null;
        this._table = this.constructor.name.toLowerCase();
        this._pk = 'id';
    }

    //数据库实例
    get db() {
        if(!this._db) this._db = new (require('./db'))(this.ctx).table(this._table);
        return this._connection ? this._db.connect(this._connection) : this._db;
    }
}

module.exports = Model;