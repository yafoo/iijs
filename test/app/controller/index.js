//const {Controller} = require('iijs');
const {Controller, helper, Db} = require('../../../iijs');
const db = new Db();

class Index extends Controller {
    async index() {
        //let readme = await this.view.load('README.md');
        let readme = await this.view.load('../README.md', true);
        readme = helper.md().render(readme);
        readme = readme.replace('</p>', '</p><hr>');
        this.assign('title', 'iijs - 一个简单轻量级Node.js MVC框架');
        this.assign('readme', readme);
        await this.fetch();
    }

    async hello() {
        await this.display(`<div style="font-size:50px;">hello iijs, hello world !</div>`);
    }

    async mysql() {
        const article = await db.table('article a').join('cate c', 'c.id=a.cate_id').field('a.title, a.id, a.click, c.cate_title').order('a.id', 'desc').select();
        this.ctx.body = article;
    }
}

module.exports = Index;