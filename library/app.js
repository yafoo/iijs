const Koa = require('koa');
const path = require('path');
const koaBody = require('koa-body');
const router = require('./router');
const root = require('./loader');
const app = new Koa();

//root
app.use(async (ctx, next) => {
    ctx.root = root(ctx);
    await next();
});

//log
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms`);
});

//static
app.use(require('koa-static')(path.join(__dirname, '../public')));

//koa-body
app.use(koaBody());

//router
app.use(router.routes());
app.use(router.allowedMethods());

//error
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app;