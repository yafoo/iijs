const path = require('path');
const Koa = require('koa');
const app = new Koa();
const cfg_app = require('./config').app;
const logger = new (require('./logger'))();
const router = require('./router');
const pjson = require('../package.json');

app.run = (...args) => {
    // error
    app.use(async (ctx, next) => {
        ctx.APP_TIME = new Date();
        ctx.APP_VERSION = pjson.version;

        if(cfg_app.app_debug) {
            try {
                await next();
            } catch (err) {
                ctx.status = err.statusCode || err.status || 500;
                ctx.body = err;
                logger.error(err);
            }
        } else {
            await next();
        }
        
        const ms = new Date() - ctx.APP_TIME;
        logger.http(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms`);
    });

    // static
    cfg_app.static_dir && app.use(require('koa-static')(path.join(path.dirname(module.parent.parent.filename), cfg_app.static_dir)));

    // koa-body
    cfg_app.koa_body && app.use(require('koa-body')(cfg_app.koa_body));

    // router
    app.use(router.routes()).use(router.allowedMethods());

    // server
    app.listen(...args);

    // run once
    delete app.run;
}

module.exports = app;