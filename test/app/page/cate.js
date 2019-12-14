//const {Page} = require('iijs');
const {Page} = require('../../../iijs');

class Index extends Page {
    constructor(ctx) {
        super(ctx);
        this.opts.urlIndex = '/test';
        this.opts.pageQuery = 'params';
        this.opts.pageSize = 10;
    }
}

module.exports = Index;