const cfg_page = require('./config').page;

const Ctx = require('./ctx');

class Page extends Ctx {
    constructor(ctx) {
        super();
        this.ctx = ctx || {};
        this.opt = cfg_page;
        this.init();
    }

    // 分页数据
    init(total, page, opt={}) {
        if(typeof page == 'object') {
            opt = page;
            page = undefined;
        }
        this.opt = {...this.opt, ...opt};
        this._total = (total && +total) || 0;
        this._page = (page && +page) || +this.ctx.query[this.opt.page_param] || +this.ctx.params[this.opt.page_param] || 1;
        this._pageSize = (this.opt.pageSize && +this.opt.pageSize) || 15;
        this._pageLength = (this.opt.page_length && +this.opt.page_length) || 3;
        this._pageTotal = this._total % this._pageSize == 0 ? this._total / this._pageSize : Math.ceil(this._total / this._pageSize);
        this._pageTotal || (this._pageTotal = 1);
        return this;
    }

    // 上一页
    prev() {
        return this._page == 1 ? '' : this._parse('linkPrev', {page: this._page - 1, url: `?page=${this._page - 1}`});
    }

    // 下一页
    next() {
        return this._page == this._pageTotal ? '' : this._parse('linkNext', {page: this._page + 1, url: `?page=${this._page + 1}`});
    }

    // 首页
    index() {
        return this._page == 1 ? '' : this._parse('linkIndex', {page: 1, url: `?page=1`});
    }

    // 末页
    end() {
        return this._page == this._pageTotal ? '' : this._parse('linkEnd', {page: this._pageTotal, url: `?page=${this._pageTotal}`});
    }

    // 信息
    info() {
        return this._parse('linkInfo', {page: this._pageTotal, total: this._total});
    }

    // 分页
    list() {
        let list = '';
        let list_start = 1;
        let list_end = this._pageLength;
        const list_left = parseInt(this._pageLength / 2);

        if(this._page >= list_end) {
            list_start = this._page - list_left;
            list_end = this._page + this._pageLength - list_left - 1;
        }
        if(list_end > this._pageTotal) {
            list_end = this._pageTotal;
            list_start = this._pageTotal - this._pageLength + 1;
        }
        if(list_start < 1) {
            list_start = 1;
        }

        for(list_start; list_start<=list_end; list_start++) {
            list += this._parse(list_start == this._page ? 'linkActive' : 'linkList', {page: list_start, url: `?page=${list_start}`});
        }
        return list;
    }

    // 分页2
    list2() {
        let list = '';
        let list_start = 1;
        let list_end = (this._pageLength * 2) + 1;
        if(this._page >= list_end) {
            list_start = this._page - this._pageLength;
            list_end = this._page + this._pageLength;
        }
        if(list_end > this._pageTotal) {
            list_end = this._pageTotal;
            list_start = this._pageTotal - this._pageLength * 2;
        }
        if(list_start < 1) {
            list_start = 1;
        }

        for(list_start; list_start<=list_end; list_start++) {
            list += this._parse(list_start == this._page ? 'linkActive' : 'linkList', {page: list_start, url: `?page=${list_start}`});
        }
        return list;
    }

    // 渲染html
    render() {
        return this.opt['pageStyle'].replace(/\$\{(\w+)\}/g, (...args) => {
            return this[args[1]]();
        });
    }

    // 解析样式
    _parse(linkKey, data) {
        return this.opt[linkKey].replace(/\$\{(\w+)\}/g, (...args) => {
            return data[args[1]];
        });
    }
}

module.exports = Page;