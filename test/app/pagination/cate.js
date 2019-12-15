//const {Pagination} = require('iijs');
const {Pagination} = require('../../../iijs');

class Index extends Pagination {
    config(opts) {
        super.config({urlIndex: '/hello/', urlPage: '/hello/list_${page}.html', pageQuery: 'params', pageSize: 10, ...opts});
    }
}

module.exports = Index;