const path = require('path');
const Koa = require('koa');
const app = new Koa();
const cfg_app = require('./config').app;
const logger = new (require('./logger'))();
const router = require('./router');

app.run = (...args) => {
    // req time
    cfg_app.app_debug && app.use(async (ctx, next) => {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        logger.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms`);
    });

    // static
    cfg_app.static_dir && app.use(require('koa-static')(path.join(path.dirname(module.parent.parent.filename), cfg_app.static_dir)));

    // koa-body
    cfg_app.koa_body && app.use(require('koa-body')(cfg_app.koa_body));

    // router
    app.use(router.routes()).use(router.allowedMethods());

    // error
    app.on('error', (err, ctx) => {
        logger.error('server error', err, ctx)
    });

    // server
    app.listen(...args);

    // run once
    delete app.run;
}

module.exports = app;