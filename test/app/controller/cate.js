const {Controller, Cookie, Url} = require('../../../iijs');
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

    async url() {
        const url =  new Url(this.ctx, this.next);
        const arr = [];
        arr.push(url.build());
        arr.push(url.build('cate', '/'));
        arr.push(url.build('index/cate', '.html'));
        arr.push(url.build('index/index/cate', '.html'));
        arr.push(url.build('app/index/index/cate', '.html'));
        arr.push(url.build('/app/index/index/cate', '.html'));
        arr.push(url.build('test', {var: 'test', var2: 'test2'}, '.html'));
        arr.push(url.build('test?var3=vvv', {var: 'test', var2: 'test2'}, '.html'));
        arr.push(url.build('test?var=vvv', {var: 'test', var2: 'test2'}, '.html'));
        arr.push(url.build('index/cate#'));
        arr.push(url.build('index/cate#', {var: 'test', var2: 'test2'}, '.html'));
        arr.push(url.build('test?var=vvv#bbb', {var: 'test', var2: 'test2'}, '.html'));
        arr.push(url.build(':name', {var: 'test', var2: 'test2', var3: 'test3'}, '.html'));

        this.display(arr.join('\n'));
    }

    async _end() {
        console.log('_end');
    }
}

module.exports = Cate;