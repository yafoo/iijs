const router = require('koa-router')();
const run = require('./run');
const cfg = require('./config');
const cfg_app = cfg.app;
const routes = cfg.route;

//注册用户路由
if (routes) {
    const methods = ['get', 'put', 'post', 'patch', 'delete', 'del'];
    for(let route of routes){
        if(!route.method || !~methods.indexOf(route.method)) route.method = 'all';
        if(typeof route.path === 'function'){
            router[route.method](route.url, route.path);
            continue;
        }
        const paths = ((cfg_app.app_multi ? '' : cfg_app.default_app + '/') + route.path.trim('/')).split('/');
        router[route.method](route.url, async (ctx, next) => {
            ctx.$app = paths[0] || cfg_app.default_app;
            ctx.$controller = paths[1] || cfg_app.default_controller;
            ctx.$action = paths[2] || cfg_app.default_action;
            await run(ctx, next, route.type);
        });
    }
}

//注册系统路由
router.all('/', async (ctx, next) => {
    setCtx(ctx);
    await run(ctx, next);
});
router.all(cfg_app.app_multi ? '/:ii_app' : '/:ii_controller', async (ctx, next) => {
    setCtx(ctx);
    await run(ctx, next);
});
router.all(cfg_app.app_multi ? '/:ii_app/:ii_controller' : '/:ii_controller/:ii_action', async (ctx, next) => {
    setCtx(ctx);
    await run(ctx, next);
});
if (cfg_app.app_multi) {
    router.all('/:ii_app/:ii_controller/:ii_action', async (ctx, next) => {
        setCtx(ctx);
        await run(ctx, next);
    });
}

function setCtx(ctx) {
    ctx.$app = ctx.params.ii_app || cfg_app.default_app;
    ctx.$controller = ctx.params.ii_controller || cfg_app.default_controller;
    ctx.$action = ctx.params.ii_action || cfg_app.default_action;
    delete ctx.params.ii_app;
    delete ctx.params.ii_controller;
    delete ctx.params.ii_action;
}

module.exports = router;