const router = require('koa-router')();
const loader = require('./loader').loader('../config');
const run = require('./run');
const config = loader.app;

//注册用户路由
if (loader.route) {
    const methods = ['get', 'put', 'post', 'patch', 'delete', 'del'];
    for(let route of loader.route){
        if(!route.method || !~methods.indexOf(route.method)) route.method = 'all';
        if(typeof route.path === 'function'){
            router[route.method](route.url, route.path);
            continue;
        }
        const paths = ((config.app_multi ? '' : config.default_app + '/') + route.path.trim('/')).split('/');
        router[route.method](route.url, async (ctx, next) => {
            ctx._app = paths[0] || config.default_app;
            ctx._controller = paths[1] || config.default_controller;
            ctx._action = paths[2] || config.default_action;
            await run(ctx, next, route.type || 'controller');
        });
    }
}

//注册系统路由
router.all('/', async (ctx, next) => {
    setCtx(ctx);
    await run(ctx, next);
});
router.all(config.app_multi ? '/:_app' : '/:_controller', async (ctx, next) => {
    setCtx(ctx);
    await run(ctx, next);
});
router.all(config.app_multi ? '/:_app/:_controller' : '/:_controller/:_action', async (ctx, next) => {
    setCtx(ctx);
    await run(ctx, next);
});
if (config.app_multi) {
    router.all('/:_app/:_controller/:_action', async (ctx, next) => {
        setCtx(ctx);
        await run(ctx, next);
    });
}

function setCtx(ctx) {
    ctx._app = ctx.params._app || config.default_app;
    ctx._controller = ctx.params._controller || config.default_controller;
    ctx._action = ctx.params._action || config.default_action;
    delete ctx.params._app;
    delete ctx.params._controller;
    delete ctx.params._action;
}

module.exports = router;