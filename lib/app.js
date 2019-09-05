const path = require('path');
const Koa = require('koa');
const static =  require('koa-static');
const koaBody = require('koa-body');
const loader = require('noader');
const router = require('./router');
const app = new Koa();

//log
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms`);
});

//static
app.use(static(path.join(path.dirname(module.parent.parent.filename), './public')));

//koa-body
app.use(koaBody());

//loader
app.use(async (ctx, next) => {
    ctx.loader = loader(path.dirname(module.parent.parent.filename), ctx, next);
    await next();
});

//router
app.use(router.routes());
app.use(router.allowedMethods());

//error
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app;