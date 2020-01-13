const Context = require('./context');

class Middleware extends Context {
    constructor(ctx, next) {
        super(ctx);
        this.next = next;
    }

    redirect(url, status) {
        this.response.redirect(url, status);
    }

    success(msg, url) {
        this.response.success(msg, url);
    }

    error(msg, url) {
        this.response.error(msg, url);
    }

    get response() {
        if(!this._response) {
            this._response = new (require('./response'))(this.ctx);
        }
        return this._response;
    }
}

module.exports = Middleware;