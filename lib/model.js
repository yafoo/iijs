const Context = require('./context');

class Model extends Context {
    constructor(ctx) {
        super(ctx);
        this._db = null;
        this.connection = null;
        this.table = this.constructor.name.toLowerCase();
        this.pk = 'id';
    }

    //数据库实例
    get db() {
        if(!this._db) this._db = new (require('./db'))(this.ctx).table(this.table);
        return this.connection ? this._db.connect(this.connection) : this._db;
    }

    set db(db) {
        this._db = db;
    }
}

module.exports = Model;