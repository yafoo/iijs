const Context = require('./context');

class Middleware extends Context {
    constructor(ctx, next) {
        super(ctx);
        this.next = next;
    }
}

module.exports = Middleware;