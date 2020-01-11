module.exports = class {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
    }

    async start() {
        console.log('middle1 start');
        await this.next();
        console.log('middle1 start await');
    }

    async end() {
        console.log('middle1 end');
        await this.next();
        console.log('middle1 end await');
    }
}