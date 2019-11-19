//const {Controller} = require('iijs');
const {Controller, helper, Db} = require('../../../iijs');

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
        const db = new Db(undefined, this.ctx);
        const list = await db.table('article a').join('cate c', 'c.id=a.cate_id').field('a.title, a.id, a.click, c.cate_title').order('a.id', 'desc').find();
        db.release();

        const Arc = require('../model/article');
        const model_article = new Arc(this.ctx, this.next);
        const list2 = await model_article.db.select();
        model_article.db.release();

        this.ctx.body = {list, list2};
    }
}

module.exports = Index;