const {app: cfg_app} = require('./config');
const Context = require('./context');

class Logger extends Context {
    log(...data) {
        cfg_app.app_debug && console.log(...data);
    }

    error(...data) {
        cfg_app.app_debug && console.error(...data);
    }

    sql(...args) {
        cfg_app.app_debug && args.forEach(msg => console.log(msg));
    }

    http(...args) {
        cfg_app.app_debug && args.forEach(msg => console.log(msg));
    }
}

module.exports = Logger;