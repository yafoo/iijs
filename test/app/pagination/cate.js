//const {Pagination} = require('iijs');
const {Pagination} = require('../../../iijs');

class Index extends Pagination {
    config() {
        this.opts.urlIndex = '/cate';
        this.opts.pageQuery = 'params';
        this.opts.pageSize = 10;
        super.config();
    }
}

module.exports = Index;