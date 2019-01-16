const router = require('koa-router')();
const config = require('./loader').loader('../config');
const run = require('./run');

//注册用户路由
if (config.route) {
    const methods = ['get', 'put', 'post', 'patch', 'delete', 'del'];
    for(let route of config.route){
        if(!route.method || !~methods.indexOf(route.method)) route.method = 'all';
        const paths = route.path.trim('/').split('/');
        const _app = paths[0] || config.app.default_app;
        const _controller = paths[1] || config.app.default_controller;
        const _action = paths[2] || config.app.default_action;

        router[route.method](route.url, async (ctx, next) => {
            ctx._app = _app;
            ctx._controller = _controller;
            ctx._action = _action;
            await run(ctx, next);
        });
    }
}

//注册系统路由
router.all('/', async (ctx, next) => {
    await run(ctx, next);
});
router.all('/:_app', async (ctx, next) => {
    await run(ctx, next);
});
router.all('/:_app/:_controller', async (ctx, next) => {
    await run(ctx, next);
});
if (config.app.app_multi) {
    router.all('/:_app/:_controller/:_action', async (ctx, next) => {
        await run(ctx, next);
    });
}

module.exports = router;