const router = require('koa-router')();
const {app: cfg_app, routes: cfg_routes} = require('./config');
const run = require('./run');

// 注册用户路由
if (cfg_routes) {
    const methods = ['get', 'put', 'post', 'patch', 'delete', 'del'];
    for(let route of cfg_routes){
        if(!route.method || !~methods.indexOf(route.method)) route.method = 'all';
        if(typeof route.path === 'function'){
            router[route.method](route.url, route.path);
            continue;
        }
        const route_path = (cfg_app.app_multi ? '' : cfg_app.default_app + '/') + route.path.replace(/^\/|\/$/g, '');
        let paths = route_path.split('/');
        router[route.method](route.url, async (ctx, next) => {
            if(~route_path.indexOf('$')) {
                paths = route_path.replace(/\$\{(\w+)\}/g, (...args) => {
                    return ctx.params[args[1]];
                }).split('/');
            }
            ctx.APP = paths[0] || cfg_app.default_app;
            ctx.CONTROLLER = paths[1] || cfg_app.default_controller;
            ctx.ACTION = paths[2] || cfg_app.default_action;
            await run(ctx, next, route.type);
        });
    }
}

// 注册系统路由
router.all(cfg_app.app_multi ? '/:ii_app?/:ii_controller?/:ii_action?' : '/:ii_controller?/:ii_action?', async (ctx, next) => {
    ctx.APP = ctx.params.ii_app || cfg_app.default_app;
    ctx.CONTROLLER = ctx.params.ii_controller || cfg_app.default_controller;
    ctx.ACTION = ctx.params.ii_action || cfg_app.default_action;
    delete ctx.params.ii_app;
    delete ctx.params.ii_controller;
    delete ctx.params.ii_action;
    await run(ctx, next);
});

module.exports = router;