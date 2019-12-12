const cfg_db = require('./config').db;
const logger = new (require('./logger'))();

//连接池
const pool = new Map();
//事务连接
const trans = new Map();
//查询缓存（内存缓存，请勿缓存巨量数据）
const cache = {};

//缓存清理
setInterval(() => {
    const now_time = Math.round(new Date() / 1000);
    for(let i in cache) {
        cache[i].time < now_time && (delete cache[i]);
    }
}, 20 * 60 * 60);

class Db {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
        this._cfg = null;
        this._table = '';
        this._prefix = '';
        this._sql = {};
        this._queryStr = '';
        this.connect();
    }

    connect(options='default') {
        this._cfg = typeof options === 'string' ? cfg_db[options] : options;
        this._prefix = this._cfg.prefix || '';
        this.reset();

        let cur_pool = pool.get(this._cfg);
        if(!cur_pool) {
            switch(this._cfg.type) {
                case 'mysql':
                    cur_pool = require('mysql').createPool(this._cfg);
                    break;
                default:
                    //other database, please provide database driver and implement the connection method
                    cur_pool = this._cfg.connect(this._cfg);
            }
            pool.set(this._cfg, cur_pool);
            logger.log('连接池创建成功！', `连接池：${pool.size}`);
        }
        
        return this;
    }

    close() {
        if(pool.get(this._cfg)) {
            pool.get(this._cfg).end(err => {
                if(err) {
                    logger.log('连接池销毁失败！', err);
                } else {
                    pool.delete(this._cfg);
                    logger.log('连接池销毁成功！');
                }
            });
            
        }
        return this;
    }

    async _creatConnect(p) {
        return new Promise((resolve, reject) => {
            p.getConnection((err, connection) => {
                if(err) {
                    reject(err);
                    logger.log('数据库建立连接失败！', err);
                } else {
                    resolve(connection);
                    logger.log('数据库建立连接成功！', `连接数：limit(${p.config.connectionLimit}) all(${p._allConnections.length}) acquiring(${p._acquiringConnections.length}) free(${p._freeConnections.length}) queue(${p._connectionQueue.length})`);
                }
            });
        });
    }

    async _getConnect() {
        return trans.get(this.ctx) || await this._creatConnect(pool.get(this._cfg));
    }

    async startTrans(fun) {
        const conn = await this._getConnect();
        trans.set(this.ctx, conn);

        return new Promise((resolve, reject) => {
            conn.beginTransaction(async (err) => {
                if(err) {
                    logger.log('开启事务失败！', err);
                    reject(false);
                } else {
                    logger.log('开启事务成功！');
                    if(typeof fun === 'function') {
                        try {
                            await fun();
                            await this.commit();
                            resolve(true);
                        } catch(e) {
                            await this.rollback();
                            resolve(false);
                        }
                    }
                    resolve(true);
                }
            });
        });
    }

    async rollback() {
        const conn = await this._getConnect();

        return new Promise((resolve, reject) => {
            conn.rollback(() => {
                resolve(true);
                conn.release() && trans.delete(this.ctx);
                logger.log('事务回滚成功！');
            });
        });
    }

    async commit() {
        const conn = await this._getConnect();

        return new Promise((resolve, reject) => {
            conn.commit((err) => {
                if(err) {
                    reject(false);
                    logger.log('事务提交失败！', err);
                } else {
                    resolve(true);
                    logger.log('事务提交成功！');
                }
                conn.release() && trans.delete(this.ctx);
            });
        });
    }

    async query(sql, params) {
        this.reset();
        const conn = await this._getConnect();

        return new Promise((resolve, reject) => {
            conn.query(sql, params, (err, data) => {
                if(err){
                    logger.log('数据操作失败，SQL：' + this.format(sql, params), err);
                    reject(err);
                }else{
                    logger.log('数据操作成功，SQL：' + this.format(sql, params));
                    resolve(data);
                }
                if(!trans.get(this.ctx)) {
                    conn.release();
                    logger.log('数据库连接释放成功！');
                }
            });
        });
    }

    reset() {
        this._sql = {
            distinct: '',
            field: [],
            join: {},
            where: [],
            group: '',
            having: '',
            order: {},
            limit: '',
            page: null,
            sqlStr: false,
            data: {}
        };
        return this;
    }

    table(table) {
        if(!table) return this;
        this._table = table.trim().replace(/ +/g, ' ');
        return this;
    }

    prefix(prefix) {
        if(typeof prefix === 'undefined') return this;
        this._prefix = prefix.trim();
        return this;
    }

    distinct() {
        this._sql.distinct = 'distinct';
        return this;
    }

    field(field) {
        if(!field) return this;
        if(typeof field === 'string') {
            field = field.split(',').map(value=>value.trim().replace(/ +/g, ' ').replace(/ as /g, ' '));
        }
        this._sql.field = [...this._sql.field, ...field];
        return this;
    }

    join(table, on, type='left') {
        if(!table) return this;
        this._sql.join[table.trim().replace(/ +/g, ' ')] = {on, type};
        return this;
    }

    where(where, logic) {
        if(!where) return this;
        this._sql.where.push([where, logic]);
        return this;
    }

    group(field) {
        if(!field) return this;
        this._sql.group = 'group by `' + field.trim().replace(/\./g, '`.`') + '`';
        return this;
    }

    having(condition) {
        if(!condition) return this;
        this._sql.having = 'having ' + condition;
        return this;
    }

    order(field, order='asc') {
        if(!field) return this;
        this._sql.order[field.trim()] = order === 'asc' ? 'asc' : 'desc';
        return this;
    }

    limit(offset, rows) {
        if(typeof offset === 'undefined') return this;
        offset = typeof offset === 'number' ? parseInt(offset) : 0;
        rows = typeof rows === 'number' ? parseInt(rows) : null;
        this._sql.limit = 'limit ' + offset + (rows ? ',' + rows : '');
        return this;
    }

    page(page, pageSize) {
        if(typeof page === 'undefined') return this;
        page = typeof page === 'number' ? parseInt(page) : 1;
        pageSize = typeof pageSize === 'number' ? parseInt(pageSize) : 10;
        this.limit((page - 1) * pageSize, pageSize);
        this._sql.page = {page, pageSize};
        return this;
    }

    cache(time) {
        this._sql.cache = time;
        return this;
    }

    sql() {
        this._sql.sqlStr = true;
        return this;
    }

    data(data) {
        if(!data) return this;
        this._sql.data = {...this._sql.data, ...data};
        return this;
    }

    async select(condition) {
        condition && (this._sql.where = [], this._sql.where.push([condition]));

        let params = [];
        const table = this._parseTable();
        const distinct = this._sql.distinct;
        const field = this._parseField();
        const join = this._parseJoin();

        const where = this._parseWhere();
        params = params.concat(where[1]);

        const order = this._parseOrder();

        const group = this._sql.group;
        const having = this._sql.having;
        const limit = this._sql.limit;

        this._queryStr = `select ${distinct} ${field} from ${table} ${join} ${where[0]} ${group} ${having} ${order} ${limit}`;

        if(this._sql.sqlStr) {
            this._sql.sqlStr = false;
            return this.format(this._queryStr, params);
        }
        
        if(this._sql.cache) {
            const cache_time = this._sql.cache;
            const cache_key = require('crypto').createHash('md5').update(this.format(this._queryStr, params)).digest('hex');
            const now_time = Math.round(new Date() / 1000);
            if(cache[cache_key] && cache[cache_key].time > now_time) {
                this.reset();
                return cache[cache_key].data;
            }
            const result = await this.query(this._queryStr, params);
            cache[cache_key] = {data: result, time: (cache_time + now_time)};
            return result;
        }

        return await this.query(this._queryStr, params);
    }

    async find() {
        this.limit(1);
        
        if(this._sql.sqlStr) {
            return await this.select();
        }

        const rows = await this.select();
        return rows.length ? rows[0] : null;
    }

    async value(field) {
        this._sql.field = [];
        this.field(field);
        
        if(this._sql.sqlStr) {
            return await this.find();
        }

        const row = await this.find();
        return row && row[field];
    }

    async count(field='*') {
        return await this.value(`count(${field})`);
    }

    async column(field, key) {
        this._sql.field = [];
        this.field(field);
        key && this.field(key);
        
        if(this._sql.sqlStr) {
            return await this.select();
        }

        const rows = await this.select();
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

        const table = this._parseTable();
        const params = this._sql.data;

        this._queryStr = `insert into ${table} set ?`;
        if(this._sql.sqlStr) {
            this._sql.sqlStr = false;
            return this.format(this._queryStr, params);
        }
        return await this.query(this._queryStr, params);
    }

    async update(data, condition) {
        data && (this._sql.data = data);
        condition && (this._sql.where = [], this._sql.where.push([condition]));

        let params = [];
        const table = this._parseTable();
        params.push(this._sql.data);

        const where = this._parseWhere();
        params = params.concat(where[1]);

        this._queryStr = `update ${table} set ? ${where[0]}`;
        if(this._sql.sqlStr) {
            this._sql.sqlStr = false;
            return this.format(this._queryStr, params);
        }
        return await this.query(this._queryStr, params);
    }

    async delete(condition) {
        condition && (this._sql.where = [], this._sql.where.push([condition]));

        let params = [];
        const table = this._parseTable();
        const where = this._parseWhere();
        params = params.concat(where[1]);

        this._queryStr = `delete from ${table} where ${where[0]}`;
        if(this._sql.sqlStr) {
            this._sql.sqlStr = false;
            return this.format(this._queryStr, params);
        }
        return await this.query(this._queryStr, params);
    }

    async execute(sql, params) {
        this._queryStr = sql;
        if(this._sql.sqlStr) {
            this._sql.sqlStr = false;
            return this.format(this._queryStr, params);
        }
        return await this.query(this._queryStr, params);
    }

    format(sql, params) {
        return require('mysql').format(sql, params);
    }

    _parseTable() {
        const table = this._table.replace(' ', '` `');
        return `\`${this._prefix}${table}\``;
    }

    _parseJoin() {
        let join = '';
        Object.keys(this._sql.join).forEach(key => {
            const table = '`' + this._prefix + key.replace(' ', '` `') + '`';
            join += (join ? ' ' : '') + this._sql.join[key].type + ' join ' + table + ' on ' + this._sql.join[key].on;
        });
        return join;
    }

    _parseField() {
        let fields = [];
        this._sql.field.forEach(value => {
            let field = value.split(' ');
            let alias = '';
            const length = field.length;
            if(length > 1 && !~field[length - 1].indexOf(')')) {
                alias = ' `' + field[length - 1] + '`';
                field.pop();
            }
            field = field.join(' ');
            if(!~field.indexOf(')')) {
                field = '`' + field.replace(/\./g, '`.`') + '`';
            }
            fields.push(field + alias);
        });
        return fields.join(',') || '*';
    }

    _parseWhere() {
        const logic = ['=', '<>', '!=', '>', '>=', '<', '<=', 'like', 'not like', 'in', 'not in', 'between', 'not between', 'is', 'is not', 'exp'];
        let where = '';
        let data = [];
        this._sql.where.forEach(item => {
            const whereList = item[0];
            const whereLink = item[1] === 'or' ? 'or' : 'and';
            let whereChild = '';
            Object.keys(whereList).forEach(field => {
                const value = whereList[field];
                field = '`' + field.replace('.', '`.`') + '`';
                let fieldLogic = '=';
                let fieldValue = null;
                let fieldLink = 'and';
                if(value instanceof Array) {
                    fieldLogic =  ~logic.indexOf(value[0]) ? value[0] : '=';
                    fieldValue = value[1];
                    fieldLink = value[2] && value[2] === 'or' ? 'or' : 'and';
                } else {
                    fieldValue = value;
                }
                if(fieldLogic === 'exp') {
                    whereChild += (whereChild ? ` ${fieldLink} ` : '') + `${fieldValue}`;
                } else {
                    whereChild += (whereChild ? ` ${fieldLink} ` : '') + `${field} ${fieldLogic} `;
                    if(~['in', 'not in'].indexOf(fieldLogic)) {
                        whereChild += `(?)`;
                        data.push(fieldValue);
                    } else if(~['between', 'not between'].indexOf(fieldLogic)) {
                        whereChild += `? and ?`;
                        typeof fieldValue === 'string' && (fieldValue = fieldValue.split(','));
                        data.push(fieldValue[0]);
                        data.push(fieldValue[1]);
                    } else {
                        whereChild += `?`;
                        data.push(fieldValue);
                    }
                }
            });
            where  += (where ? ` ${whereLink} ` : '') + `(${whereChild})`;
        });
        where && (where = 'where ' + where);
        return [where, data];
    }

    _parseOrder() {
        let order = '';
        Object.keys(this._sql.order).forEach(key => {
            const field = '`' + key.replace('.', '`.`') + '`';
            order += (order ? ',' : 'order by ') + field + (this._sql.order[key] ? ' ' + this._sql.order[key] : '');
        });
        return order;
    }
}

module.exports = Db;