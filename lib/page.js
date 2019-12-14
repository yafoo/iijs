const cfg_page = require('./config').page;
const Ctx = require('./ctx');

class Page extends Ctx {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.opts = cfg_page;
    }

    // 分页数据
    init(total, page, opts={}) {
        if(typeof page == 'object') {
            opts = page;
            page = undefined;
        }
        this.opts = {...this.opts, ...opts};
        this._pageQuery = this.opts.pageQuery;
        this._pageKey = this.opts.pageKey;
        this._total = (total && +total) || 0;
        this.ctx = this.ctx || {};
        this.ctx[this._pageQuery] = this.ctx[this._pageQuery] || {};
        this._page = (page && +page) || +this.ctx[this._pageQuery][this._pageKey] || 1;
        this._pageSize = (this.opts.pageSize && +this.opts.pageSize) || 15;
        this._pageLength = (this.opts.pageLength && +this.opts.pageLength) || 3;
        this._pageTotal = this._total % this._pageSize == 0 ? this._total / this._pageSize : Math.ceil(this._total / this._pageSize);
        this._pageTotal || (this._pageTotal = 1);
        return this;
    }

    // 上一页
    prev() {
        return this._page == 1 ? '' : this._parseLink('linkPrev', this._page - 1);
    }

    // 下一页
    next() {
        return this._page == this._pageTotal ? '' : this._parseLink('linkNext', this._page + 1);
    }

    // 首页
    index() {
        return this._page == 1 ? '' : this._parseLink('linkIndex', 1);
    }

    // 末页
    end() {
        return this._page == this._pageTotal ? '' : this._parseLink('linkEnd', this._pageTotal);
    }

    // 信息
    info() {
        return this._parseLink('linkInfo', this._pageTotal);
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
            list += this._parseLink(list_start == this._page ? 'linkActive' : 'linkList', list_start);
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
            list += this._parseLink(list_start == this._page ? 'linkActive' : 'linkList', list_start);
        }
        return list;
    }

    // 渲染html
    render() {
        return this.opts['pageRender'].replace(/\$\{(\w+)\}/g, (...args) => {
            return this[args[1]]();
        });
    }

    // 解析链接
    _parseLink(linkKey, page) {
        return this.opts[linkKey].replace(/\$\{(\w+)\}/g, (...args) => {
            return args[1] == 'page' ? page : args[1] == 'total' ? this._total : this._parseUrl(page);
        });
    }

    // 解析网址
    _parseUrl(page) {
        if(this.opts.urlPage == '') {
            const url = this.ctx.url;
            const urls = url.split('?');
            if(this.ctx[this._pageQuery][this._pageKey]) {
                if(this._pageQuery == 'params') {
                    this.opts.urlPage = urls[0].replace(/(\d+)/g, (...args) => {
                        return args[1] == this._page ? '${page}' : args[1];
                    }) + (urls[1] ? ('?' + urls[1]) : '');
                } else {
                    this.opts.urlPage = url.replace(this._pageKey + '=' + this._page, this._pageKey + '=${page}');
                }
            } else {
                if(this.opts.urlIndex == '') {
                    this.opts.urlIndex = this.ctx.url;
                }
                if(this._pageQuery == 'params') {
                    this.opts.urlPage = urls[0].replace(/\/$/g, '') + '/${page}' + (urls[1] ? ('?' + urls[1]) : '');
                } else {
                    this.opts.urlPage = url + (urls[1] ? '&' : '?') + this._pageKey + '=${page}';
                }
            }
        }
        if(this.opts.urlIndex == '') {
            this.opts.urlIndex = this.ctx.url;
        }

        return (page == 1 ? this.opts.urlIndex : this.opts.urlPage).replace('${page}', page);;
    }
}

module.exports = Page;