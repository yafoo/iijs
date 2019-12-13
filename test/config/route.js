route = [
    {url: '/hello', path: 'index/hello', method: 'get'},
    {url: '/mysql', path: 'index/mysql', method: 'get'},
    {url: '/file', path: 'index/index', method: 'get', type: 'view'},
    {url: '/:mysql', path: 'index/${mysql}', method: 'get'},
];

module.exports = route;