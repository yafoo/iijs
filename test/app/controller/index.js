//const {Controller} = require('iijs');
const {Controller, Db} = require('../../../iijs');

class Index extends Controller {
    async index() {
        //let readme = await this.view.load('README.md');
        let readme = await this.view.load('../README.md', true);
        //readme = helper.md().render(readme);
        readme = readme.replace('</p>', '</p><hr>');
        this.assign('title', 'iijs - 一个简单轻量级Node.js MVC框架');
        this.assign('readme', readme);
        await this.fetch();
    }

    async hello() {
        console.log(this.$root);
        console.log(this.$model);
        console.log(this.$model.article);
        console.log(this.$model.article === this.$model.article);
        console.log(this.$model.article.db === this.$model.article.db);
        console.log(this.$app);
        console.log(this.$config);
        console.log(this.$config.app);
        await this.display(`<div style="font-size:50px;">hello iijs, hello world !</div>`);
    }

    async mysql() {
        const db = new Db(this.ctx);
        const list = await db.table('article a').field('a.title, a.id, a.click, c.cate_name').join('cate c', 'c.id=a.cate_id').where({'a.click': ['in', '102,201'], source: ['=', 'me', 'or']}).where({add_time: 2, update_time: 0}, 'or').where({add_time: ['>=', 0], update_time: 0}).group('add_time').having('add_time>1').order('a.id', 'desc').limit(0, 10).select();

        const Arc = require('../model/article');
        const model_article = new Arc(this.ctx, this.next);
        const [list2, list3, list4] = await Promise.all([
            model_article.db.find(),
            this.ctx.$iijs.app.model.article.db.find(),
            this.ctx.$iijs.app.model.article.db.page(2, 3).select()
        ]);
        //const list2 = model_article.db.find();
        //const list3 = this.ctx.$iijs.app.model.article.db.find();
        //const list4 = this.ctx.$iijs.app.model.article.db.page(2, 3).select();
        //const data = {"cate_id":2,"user_id":0,"title":"测试文章","writer":"雨思","source":"me","source_link":"","click":200,"keywords":"测试,文章","description":"这是一篇测试文章","content":"测试文章测试'文章测试文章内容"};
        //const data2 = {"cate_id":2,"user_id":0,"title":"rtrtrt","writer":"雨思","source":"me","source_link":"","click":200,"keywords":"测试,文章","description":"这是一篇测试文章","content":"test'cccccc"};
        //console.log(await model_article.db.table('article').sql().insert(data));
        

        this.ctx.body = {list, list2, list3, list4};
    }
}

module.exports = Index;