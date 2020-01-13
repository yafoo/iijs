const cfg_tpl = require('./config').tpl;
const Context = require('./context');

class Response extends Context {
    constructor(ctx) {
        super(ctx);
        this.tpl_jump = cfg_tpl.jump;
        this.wait = 3;
    }

    redirect(url, status=302) {
        this.ctx.redirect(this.url.build(url), status);
    }

    success(msg='操作成功！', url) {
        url = typeof url == 'string' ? this.url.build(url) : this.ctx.origin;
        this.jump(msg, url, 1);
    }

    error(msg='操作失败！', url) {
        url = typeof url == 'string' ? this.url.build(url) : 'javascript:history.back(-1);';
        this.jump(msg, url, 0);
    }

    jump(msg, url, state=1) {
        const data = {state, msg, url, wait: this.wait};
        this.ctx.body = this.ctx.headers['x-requested-with'] == 'XMLHttpRequest' ? data : this.tpl_jump.replace(/\{\$(\w+)\}/g, (...args) => {
            return data[args[1]];
        });
    }

    wait(time) {
        this.wait = time;
        return this;
    }

    get url() {
        if(!this._url) {
            this._url = new (require('./url'))(this.ctx);
        }
        return this._url;
    }
}

module.exports = Response;