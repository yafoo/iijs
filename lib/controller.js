class Controller {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
        this._view = null;
        this._init();
    }

    _init() {}

    async fetch(template) {
        await this.view.fetch(template);
        return this;
    }

    async display(content) {
        this.view.display(content);
        return this;
    }

    assign(name, value){
        this.view.assign(name, value);
        return this;
    }

    //视图实例
    get view() {
        if(!this._view) this._view = new (require('./view.js'))(this.ctx, this.next);
        return this._view;
    }
}

module.exports = Controller;