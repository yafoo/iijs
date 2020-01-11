routes = [
    {url: '/hello/', path: 'index/hello', method: 'get', type: 'middleware'},
    {url: '/hello', path: 'index/hello', method: 'get'},
    {url: '/hello/', path: 'index/world', method: 'get', type: 'middleware'},
    {url: '/hello/list_:page.html*', path: 'index/hello', method: 'get'},
    {url: '/mysql', path: 'index/mysql', method: 'get'},
    {url: '/file', path: 'index/index', method: 'get', type: 'view'},
    {url: '/:test/:var2/:var', path: 'index/index', method: 'get', type: 'view', name: 'name'},
    // {url: '/:mysql', path: 'index/${mysql}', method: 'get'},
];

module.exports = routes;