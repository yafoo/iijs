const path = require('path');
const Koa = require('koa');
const app = new Koa();
const cfg = require('./config').app;

//log
cfg.app_debug || app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms`);
});

//static
cfg.static_dir || app.use(require('koa-static')(path.join(path.dirname(module.parent.parent.filename), cfg.static_dir)));

//koa-body
app.use(require('koa-body')());

//loader
app.use(async (ctx, next) => {
    ctx.loader = require('noader')(path.dirname(module.parent.parent.filename), ctx, next);
    await next();
});

//router
const router = require('./router');
app.use(router.routes());
app.use(router.allowedMethods());

//error
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app;