const {app: cfg_app} = require('./config');

class Logger {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
    }

    log(...data) {
        cfg_app.app_debug && console.log(...data);
    }
}

module.exports = Logger;