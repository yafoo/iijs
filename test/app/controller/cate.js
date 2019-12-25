const {Controller, Db} = require('../../../iijs');
let times = 0
class Cate extends Controller {
    async cate() {
        if(times < 3){
            times++;
            console.log(this.ctx.status);
            this.ctx.body = 'test';
        }
    }
}

module.exports = Cate;