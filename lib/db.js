const dbs = {};
const cfg_db = require('./config').db;
const logger = new (require('./logger'))();

class Db {
    constructor(table='') {
        this._table = table;
        this._sql = {};
        this._db = null;
        this.connect();
    }

    connect(options='default') {
        this._cfg = typeof options === 'string' ? cfg_db[options] : options;
        this._prefix = this._cfg.prefix;

        if(!dbs[this._cfg.handle]) {
            switch(this._cfg.type) {
                case 'mysql':
                    dbs[this._cfg.handle] = require('mysql').createPool(this._cfg);
                    break;
                default:
                    // other database, please provide database driver and implement the connection method
                    dbs[this._cfg.handle] = this._cfg.connect(this._cfg);
            }
        }
        
        this._db = dbs[this._cfg.handle];
        return this;
    }

    async query(sql, params) {
        return new Promise((resolve, reject) => {
            this._db.getConnection(function(err, connection) {
                if(err) {
                    logger.log('数据库建立连接失败。', err);
                    reject(err);
                } else {
                    connection.query(sql, params, function(err, data){
                        connection.release();
                        if(err){
                            logger.log('数据操作失败，SQL：' + sql, err);
                            reject(err);
                        }else{
                            logger.log('数据操作成功，SQL：' + sql, data);
                            resolve(data);
                        }
                    });
                }
            });
        });
    }

    table(table) {
        this._table = table;
        return this;
    }

    prefix(prefix) {
        this._prefix = prefix;
        return this;
    }

    join(table, on, type='left') {
        this._sql.join
        this._sql.join || (this._sql.join = {});
        this._sql.join[table] = {on, type};
        return this;
    }

    where(where) {
        if(!where) {
            return this;
        }
        this._sql.where || (this._sql.where = {});
        this._sql.where = {...this._sql.where, ...where};
        return this;
    }

    data(data) {
        if(!data) {
            return this;
        }
        this._sql.data || (this._sql.data = {});
        this._sql.data = {...this._sql.data, ...data};
        return this;
    }

    field(field) {
        if(!field) {
            return this;
        }
        this._sql.field || (this._sql.field = []);
        this._sql.field = [...this._sql.field, ...field.split(',').map(value=>value.trim())];
        return this;
    }

    order(field, order='') {
        if(!field) {
            return this;
        }
        this._sql.order || (this._sql.order = {});
        this._sql.order[field] = order;
        return this;
    }

    limit(offset=0, length=0) {
        offset = parseInt(offset);
        length = parseInt(length);
        this._sql.limit = 'limit ' + offset + (length ? ',' + length : '');
        return this;
    }

    page(page=1, length=10) {
        this.limit((page - 1) * length, length);
        this._sql.page = {page, length};
        return this;
    }

    group(field) {
        this._sql.group = 'group by ' + field;
        return this;
    }

    having(condition) {
        this._sql.having = 'having ' + condition;
        return this;
    }

    cache() {
        // todo
        return this;
    }

    clear() {
        this._sql = {};
        return this;
    }

    close() {
        this._db.end();
        this._db = dbs[this._cfg.handle] = null;
        return this;
    }

    _parseWhere() {
        const where = '';
        this._sql.where && Object.keys(this._sql.where).forEach(key => {
            where += (where ? ' and ' : '') + key + '=' + this._sql.where[key];
        });
        return where;
    }

    async select(condition) {
        if(condition) {
            this._sql.where = condition;
        }
        const table = this._prefix + this._table;
        let join = '';
        this._sql.join && Object.keys(this._sql.join).forEach(table => {
            join += (join ? ' ' : '') + this._sql.join[table].type + ' join ' + this._prefix + table + ' on ' + this._sql.join[table].on;
        });
        const where = this._parseWhere();
        const fields = this._sql.field ? this._sql.field.join(',') : '*';
        let order = '';
        this._sql.order && Object.keys(this._sql.order).forEach(key => {
            order += (order ? ',' : '') + key + (this._sql.order[key] ? ' ' + this._sql.order[key] : '');
        });
        order && (order = 'order by ' + order);
        const group = this._sql.group || '';
        const having = this._sql.having || '';
        const limit = this._sql.limit || '';
        return await this.clear().query(`select ${fields} from ${table} ${join} ${where} ${group} ${order} ${having} ${limit}`);
    }

    async find() {
        this.limit(1);
        const rows = await this.select();
        return rows && rows[0];
    }

    async value(field) {
        this._sql.field = null;
        this.field(field);
        const row = await this.find();
        return row && row[field];
    }

    async column(field, key) {
        this._sql.field = null;
        this.field(field);
        key && this.field(key);
        const rows = await this.select();
        if(!rows) {
            return rows;
        }
        const result = key ? {} : [];
        rows.forEach(row => {
            if(key) {
                result[row[key]] = row[field];
            } else {
                result.push(row[field]);
            }
        });
        return result;
    }

    async insert(data) {
        if(data) {
            this._sql.data = data;
        }
        const table = this._prefix + this._table;
        const fields = Object.keys(this._sql.data || {}).join(',');
        const values = Object.values(this._sql.data || {}).join(',');
        return await this.clear().query(`insert into ${table} (${fields}) values (${values})`);
    }

    async update(data, condition) {
        if(data) {
            this._sql.data = data;
        }
        if(condition) {
            this._sql.where = condition;
        }
        const table = this._prefix + this._table;
        let data = '';
        this._sql.data && Object.keys(this._sql.data).forEach(key => {
            data += (data ? ',' : '') + key + '=' + this._sql.data[key];
        });
        const where = this._parseWhere();
        return await this.clear().query(`update ${table} set ${data} where ${where}`);
    }

    async delete(condition) {
        if(condition) {
            this._sql.where = condition;
        }
        const table = this._prefix + this._table;
        const where = this._parseWhere();
        return await this.clear().query(`delete from ${table} where ${where}`);
    }
}

module.exports = Db;