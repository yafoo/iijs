class Controller {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
        this._view = null;
    }

    //视图实例
    get view(){
        if(!this._view) this._view = new (require('./view.js'))(this.ctx, this.next);
        return this._view;
    }
}

module.exports = Controller;