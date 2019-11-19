const cfg_db = require('./config').db;
const logger = new (require('./logger'))();

//连接池
const pool = {};
//用户连接
const conn = new Map();
//查询缓存
const cache = {};

class Db {
    constructor(table='', user) {
        this._user = user;
        this._table = table;
        this._prefix = '';
        this._sql = {};
        this._query = '';
        this.connect();
    }

    connect(options='default') {
        this._cfg = typeof options === 'string' ? cfg_db[options] : options;
        this._prefix = this._cfg.prefix;
        this._handle = this._cfg.handle;
        this.reset();

        if(!pool[this._handle]) {
            switch(this._cfg.type) {
                case 'mysql':
                    pool[this._handle] = require('mysql').createPool(this._cfg);
                    break;
                default:
                    //other database, please provide database driver and implement the connection method
                    pool[this._handle] = this._cfg.connect(this._cfg);
            }
            logger.log('连接池创建成功！');
            pool[this._handle].on('release', function (connection) {
                console.log('Connection %d released', connection.threadId);
            });
        }
        
        return this;
    }

    async getConnection(pool) {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if(err) {
                    logger.log('数据库建立连接失败！', err);
                    reject(err);
                } else {
                    logger.log('数据库建立连接成功！');
                    resolve(connection);
                }
            });
        });
    }

    async query(sql, params) {
        this.reset();
        let user_conn = conn.get(this._user) || {};
        if(!user_conn || !user_conn[this._handle]) {
            user_conn[this._handle] = await this.getConnection(pool[this._handle]);
            conn.set(this._user, user_conn);
        }

        return new Promise((resolve, reject) => {
            user_conn[this._handle].query(sql, params, function(err, data){
                if(err){
                    logger.log('数据操作失败，SQL：' + sql, err);
                    reject(err);
                }else{
                    logger.log('数据操作成功，SQL：' + sql, data);
                    resolve(data);
                }
            });
        });
    }

    release() {
        const user_conn = conn.get(this._user);
        if(user_conn && user_conn[this._handle]) {
            user_conn[this._handle].release();
            logger.log('数据库连接释放成功！');
        }
        delete user_conn[this._handle];
        conn.set(this._user, user_conn);
        return this;
    }

    close() {
        if(pool[this._handle]) {
            pool[this._handle].end(err => {
                if(err) {
                    logger.log('连接池销毁失败！', err);
                } else {
                    logger.log('连接池销毁成功！');
                    delete pool[this._handle];
                }
            });
            
        }
        return this;
    }

    reset() {
        this._sql = {
            join: {},
            where: {},
            data: {},
            field: [],
            order: {},
            limit: '',
            page: null,
            group: '',
            having: '',
            cache: false,
            query: false
        };
        return this;
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
        this._sql.join[table] = {on, type};
        return this;
    }

    where(where) {
        if(!where) {
            return this;
        }
        this._sql.where = {...this._sql.where, ...where};
        return this;
    }

    data(data) {
        if(!data) {
            return this;
        }
        this._sql.data = {...this._sql.data, ...data};
        return this;
    }

    field(field) {
        if(!field) {
            return this;
        }
        if(typeof field === 'string') {
            field = field.split(',').map(value=>value.trim());
        }
        this._sql.field = [...this._sql.field, ...field];
        return this;
    }

    order(field, order='') {
        if(!field) {
            return this;
        }
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

    cache(time) {
        this._sql.cache = time;
        return this;
    }

    sql() {
        this._sql.query = true;
        return this;
    }

    _parseWhere() {
        let where = '';
        Object.keys(this._sql.where).forEach(key => {
            where += (where ? ' and ' : 'where ') + key + '=' + this._sql.where[key];
        });
        return where;
    }

    async select(condition) {
        condition && (this._sql.where = condition);

        const table = this._prefix + this._table;

        let join = '';
        Object.keys(this._sql.join).forEach(table => {
            join += (join ? ' ' : '') + this._sql.join[table].type + ' join ' + this._prefix + table + ' on ' + this._sql.join[table].on;
        });

        const where = this._parseWhere();
        const fields = this._sql.field.length ? this._sql.field.join(',') : '*';

        let order = '';
        Object.keys(this._sql.order).forEach(key => {
            order += (order ? ',' : '') + key + (this._sql.order[key] ? ' ' + this._sql.order[key] : '');
        });
        order && (order = 'order by ' + order);

        const group = this._sql.group;
        const having = this._sql.having;
        const limit = this._sql.limit;

        this._query = `select ${fields} from ${table} ${join} ${where} ${group} ${order} ${having} ${limit}`;

        if(this._sql.query) {
            this._sql.query = false;
            return this._query;
        }
        
        const cache_time = this._sql.cache;
        if(cache_time) {
            const key = require('crypto').createHash('md5').update(this._query).digest('hex');
            const now_time = Math.round(new Date() / 1000);
            if(cache[key] && cache[key].time > now_time) {
                this.reset();
                return cache[key].data;
            }
            const result = await this.query(this._query);
            cache[key] = {data: result, time: (cache_time + now_time)};
            return result;
        }

        return await this.query(this._query);
    }

    async find() {
        this.limit(1);
        const rows = await this.select();
        if(this._sql.query) {
            this._sql.query = false;
            return this._query;
        }
        return rows.length ? rows[0] : null;
    }

    async value(field) {
        this._sql.field = [];
        this.field(field);
        const row = await this.find();
        if(this._sql.query) {
            this._sql.query = false;
            return this._query;
        }
        return row && row[field];
    }

    async column(field, key) {
        this._sql.field = [];
        this.field(field);
        key && this.field(key);
        const rows = await this.select();
        if(this._sql.query) {
            this._sql.query = false;
            return this._query;
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
        data && (this._sql.data = data);

        const table = this._prefix + this._table;
        const fields = Object.keys(this._sql.data).join(',');
        const values = Object.values(this._sql.data).join(',');

        this._query = `insert into ${table} (${fields}) values (${values})`;
        if(this._sql.query) {
            this._sql.query = false;
            return this._query;
        }
        return await this.query(this._query);
    }

    async update(data, condition) {
        data && (this._sql.data = data);
        condition && (this._sql.where = condition);

        const table = this._prefix + this._table;

        let data = '';
        Object.keys(this._sql.data).forEach(key => {
            data += (data ? ',' : '') + key + '=' + this._sql.data[key];
        });

        const where = this._parseWhere();

        this._query = `update ${table} set ${data} where ${where}`;
        if(this._sql.query) {
            this._sql.query = false;
            return this._query;
        }
        return await this.query(this._query);
    }

    async delete(condition) {
        condition && (this._sql.where = condition);

        const table = this._prefix + this._table;
        const where = this._parseWhere();

        this._query = `delete from ${table} where ${where}`;
        if(this._sql.query) {
            this._sql.query = false;
            return this._query;
        }
        return await this.query(this._query);
    }
}

module.exports = Db;