const path = require('path');
const Koa = require('koa');
const static =  require('koa-static');
const koaBody = require('koa-body');
const loader = require('./loader');
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
app.use(static(path.join(__dirname, '../public')));

//koa-body
app.use(koaBody());

//loader
app.use(loader.middle('../'));

//router
app.use(router.routes());
app.use(router.allowedMethods());

//error
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app;