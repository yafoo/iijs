const Controller = require('../../library/controller');
const db = require('../../config/db');

class index extends Controller {
    async index() {
        const readme = this.view.load('.././README.md').markdown().html();
        this.view.assign('title', 'iijs - 一个简单轻量级nodejs MVC框架');
        this.view.assign('readme', readme);
        this.view.fetch();
    }

    async doc() {
        this.view.assign('title', 'iijs文档手册 - iijs');
        this.view.fetch();
    }

    async hello() {
        this.view.assign('title', 'hello world ! - iijs');
        this.view.display(`<div style="font-size:50px;">hello iijs, hello world !</div>`);
    }

    async mysql() {
        await db('select * from link').then(function(data){
            this.view.display(data);
        }).catch(function(err){
            console.log(err);
            this.view.display(err);
        });
    }
}

module.exports = index;