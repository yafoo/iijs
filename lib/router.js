const path = require('path');
const router = require('koa-router')();
const noader = require('noader');
const run = require('./run');
const {app: cfg_app, route: cfg_route} = require('./config');

//注册用户路由
if (cfg_route) {
    const methods = ['get', 'put', 'post', 'patch', 'delete', 'del'];
    for(let route of cfg_route){
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
            setLoader(ctx, next);
            await run(ctx, next, route.type);
        });
    }
}

//注册系统路由
router.all('/', async (ctx, next) => {
    setCtx(ctx, next);
    await run(ctx, next);
});
router.all(cfg_app.app_multi ? '/:ii_app' : '/:ii_controller', async (ctx, next) => {
    setCtx(ctx, next);
    await run(ctx, next);
});
router.all(cfg_app.app_multi ? '/:ii_app/:ii_controller' : '/:ii_controller/:ii_action', async (ctx, next) => {
    setCtx(ctx, next);
    await run(ctx, next);
});
if (cfg_app.app_multi) {
    router.all('/:ii_app/:ii_controller/:ii_action', async (ctx, next) => {
        setCtx(ctx, next);
        await run(ctx, next);
    });
}

function setCtx(ctx, next) {
    ctx.$app = ctx.params.ii_app || cfg_app.default_app;
    ctx.$controller = ctx.params.ii_controller || cfg_app.default_controller;
    ctx.$action = ctx.params.ii_action || cfg_app.default_action;
    delete ctx.params.ii_app;
    delete ctx.params.ii_controller;
    delete ctx.params.ii_action;
    setLoader(ctx, next);
}

function setLoader(ctx, next) {
    ctx.$iijs = noader(path.dirname(module.parent.parent.parent.filename), ctx, next);
    ctx.$iijs.config === undefined && (ctx.$iijs.config = {});
    ctx.$iijs.config.app = cfg_app;
}

module.exports = router;