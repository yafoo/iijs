//const {Context} = require('iijs');
const {Context} = require('../../../iijs');

class Index extends Context {
    async index() {
        console.log('验证登录');
        await this.next();
    }

    async hello() {
        console.log('验证登录');
        await this.next();
        console.log('业务完成');
    }
}

module.exports = Index;