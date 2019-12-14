const Ctx = require('./ctx');

class Controller extends Ctx {
    constructor(ctx, next) {
        super();
        this.ctx = ctx;
        this.next = next;
        this._view = null;
    }

    //直接内容输出
    async display(content) {
        await this.view.display(content);
    }

    //直接文件输出
    async load(template, html=false){
        return await this.view.load(template, html);
    }

    //渲染内容输出
    async render(content, html=false) {
        return await this.view.render(content, html);
    }

    //渲染文件输出
    async fetch(template, html=false) {
        return await this.view.fetch(template, html);
    }

    //赋值模版数据
    assign(name, value){
        this.view.assign(name, value);
    }

    //获取模版数据
    data(name){
        return this.view.data(name);
    }

    //视图实例
    get view() {
        if(!this._view) this._view = new (require('./view'))(this.ctx, this.next);
        return this._view;
    }
}

module.exports = Controller;