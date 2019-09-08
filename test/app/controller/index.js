//const {Controller} = require('iijs');
const {Controller} = require('../../../iijs');

class Index extends Controller {
    async index() {
        //let readme = await this.view.load('README.md');
        let readme = await this.view.load('../README.md', true);
        readme = this.view.md.render(readme);
        readme = readme.replace('</p>', '</p><hr>');
        this.assign('title', 'iijs - 一个简单轻量级Node.js MVC框架');
        this.assign('readme', readme);
        await this.fetch();
    }

    async hello() {
        await this.display(`<div style="font-size:50px;">hello iijs, hello world !</div>`);
    }
}

module.exports = Index;