const path = require('path');
const Koa = require('koa');
const app = new Koa();
const {app: cfg_app, db: cfg_db} = require('./config');
const logger = new require('./logger');

//log
cfg_app.app_debug && app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    logger.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms`);
});

//static
cfg_app.static_dir && app.use(require('koa-static')(path.join(path.dirname(module.parent.parent.filename), cfg_app.static_dir)));

//koa-body
cfg_app.koa_body !== false && app.use(require('koa-body')(cfg_app.koa_body));

//loader
app.use(async (ctx, next) => {
    ctx.$ii = require('noader')(path.dirname(module.parent.parent.filename), ctx, next);
    ctx.$ii.config === undefined && (ctx.$ii.config = {});
    ctx.$ii.config.app = cfg_app;
    ctx.$ii.config.db = cfg_db;
    await next();
});

//router
const router = require('./router');
app.use(router.routes());
app.use(router.allowedMethods());

//error
app.on('error', (err, ctx) => {
    logger.error('server error', err, ctx)
});

module.exports = app;