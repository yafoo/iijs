const Ctx = require('./ctx');

class Context extends Ctx {
    constructor(ctx, next) {
        super();
        this.ctx = ctx;
        this.next = next;
    }
}

module.exports = Context;