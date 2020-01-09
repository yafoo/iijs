const {Controller, Cookie} = require('../../../iijs');
class Cate extends Controller {
    async _init() {
        console.log('_init');
    }

    async index() {
        this.display('cate index');
    }

    async cate() {
        const cookie = new Cookie(this.ctx, this.next);
        cookie.set('test', 'value');
        cookie.set('test2', 'value2', {maxAge: 1000 * 3600});
        cookie.set('test4', 'value4', {expires: new Date('2020-07-06')});
        this.display(cookie.all());
    }

    async _end() {
        console.log('_end');
    }
}

module.exports = Cate;