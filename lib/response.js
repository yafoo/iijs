const cfg_tpl = require('./config').tpl;
const Context = require('./context');

class Response extends Context {
    constructor(ctx) {
        super(ctx);
        this.tpl_jump = cfg_tpl.jump;
        this.wait = 3;
    }

    redirect(url, status=302) {
        this.ctx.redirect(this.$$url.build(url), status);
    }

    success(msg='操作成功！', url) {
        typeof msg == 'object' && ([msg, url] = ['操作成功！', msg]);
        url = typeof url == 'string' ? this.$$url.build(url) : (url || this.ctx.header.referer);
        this.jump(msg, url, 1);
    }

    error(msg='操作失败！', url) {
        typeof msg == 'object' && ([msg, url] = ['操作失败！', msg]);
        url = typeof url == 'string' ? this.$$url.build(url) : (url || 'javascript:history.back(-1);');
        this.jump(msg, url, 0);
    }

    jump(msg, url, state=1) {
        const tplData = {state, msg, url, wait: this.wait};
        this.ctx.body = this.ctx.headers['x-requested-with'] == 'XMLHttpRequest' ? {state, msg, data: url} : this.tpl_jump.replace(/\{\$(\w+)\}/g, (...args) => {
            return tplData[args[1]];
        });
    }

    wait(time) {
        this.wait = time;
        return this;
    }
}

module.exports = Response;