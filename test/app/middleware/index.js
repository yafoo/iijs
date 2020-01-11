//const {Middleware} = require('iijs');
const {Middleware} = require('../../../iijs');

class Index extends Middleware {
    async index() {
        console.log('验证登录');
        await this.next();
    }

    async hello() {
        console.log('验证登录');
        await this.next();
        console.log('业务完成');
    }

    async world() {
        console.log('hello world!');
    }
}

module.exports = Index;