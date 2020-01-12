const cfg_tpl = require('./config').tpl;
const Context = require('./context');

class Response extends Context {
    constructor(ctx) {
        super(ctx);
        this.tpl_jump = cfg_tpl.jump;
        this.wait = 3;
    }

    redirect(url, status=302) {
        this.ctx.redirect(this.build(url), status);
    }

    success(msg='操作成功！', url) {
        url = typeof url == 'string' ? this.build(url) : this.ctx.origin;
        this.jump(1, msg, url);
    }

    error(msg='操作失败！', url) {
        url = typeof url == 'string' ? this.build(url) : 'javascript:history.back(-1);';
        this.jump(0, msg, url);
    }

    jump(state, msg, url) {
        const data = {state, msg, url, wait: this.wait};
        this.ctx.body = this.ctx.headers['x-requested-with'] == 'XMLHttpRequest' ? data : this.tpl_jump.replace(/\{\$(\w+)\}/g, (...args) => {
            return data[args[1]];
        });
    }

    get url() {
        if(!this._url) {
            this._url = new (require('./url'))(this.ctx);
        }
        return this._url;
    }

    build(url) {
        return url.slice(0, 4) != 'http' && url.slice(0, 1) != '/' ? this.url.build(url) : url;
    }
}

module.exports = Response;