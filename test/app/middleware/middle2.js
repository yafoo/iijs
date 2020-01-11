module.exports = class {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
    }

    async start() {
        console.log('middle2 start');
        await this.next();
        console.log('middle2 start await');
    }

    async end() {
        console.log('middle2 end');
    }
}