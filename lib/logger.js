const {app: cfg_app} = require('./config');

const Ctx = require('./ctx');

class Logger extends Ctx {
    constructor(ctx, next) {
        super();
        this.ctx = ctx;
        this.next = next;
    }

    log(...data) {
        cfg_app.app_debug && console.log(...data);
    }

    error(...data) {
        cfg_app.app_debug && console.error(...data);
    }
}

module.exports = Logger;