const path = require('path');
const noader = require('noader');
const {readFile} = require('./utils/fs');
const {app: cfg_app, db: cfg_db, page: cfg_page} = require('./config');
const logger = new (require('./logger'))();
const compose = require('koa-compose');

async function run(ctx, next, type=cfg_app.controller_folder) {
    // 设置根加载器
    ctx.$$ = noader('./', ctx);
    ctx.$ = noader(path.dirname(module.parent.parent.parent.parent.filename), ctx);
    ctx.$.config === undefined && (ctx.$.config = {});
    ctx.$.config.app = cfg_app;
    ctx.$.config.db = cfg_db;
    ctx.$.config.page = cfg_page;

    // 应用、控制器、方法名字验证
    if (~ctx.APP.indexOf('.') || ~ctx.CONTROLLER.indexOf('.') || ~ctx.ACTION.indexOf('.')) {
        if (cfg_app.app_debug) {
            ctx.body = `应用、控制器或方法名字不合法！`;
            logger.log(ctx.body);
        }
        return;
    }

    if (ctx.APP[0] == '_' || !ctx.$[ctx.APP]) {
        if (cfg_app.app_debug) {
            ctx.body = `应用:${ctx.APP}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    if (!ctx.$[ctx.APP][type]) {
        if (cfg_app.app_debug) {
            ctx.body = `目录:${ctx.APP}/${type}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    // 模版文件内容直接输出
    if(type == cfg_app.view_folder) {
        const content = await readFile(path.join(ctx.$[ctx.APP][type].$map.path, ctx.CONTROLLER + cfg_app.view_depr + ctx.ACTION + cfg_app.view_ext));
        if(!content && cfg_app.app_debug) {
            ctx.body = `模板文件:${ctx.APP}/${type}/${ctx.CONTROLLER + cfg_app.view_depr + ctx.ACTION + cfg_app.view_ext}不存在！`;
            logger.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    // 控制器
    const Controller = ctx.$[ctx.APP][type][ctx.CONTROLLER] || ctx.$[ctx.APP][type]['empty'];

    if (ctx.CONTROLLER[0] == '_' || ctx.CONTROLLER == 'empty' || typeof Controller != 'function') {
        if (cfg_app.app_debug) {
            ctx.body = `文件或模板目录:${ctx.APP}/${type}/${ctx.CONTROLLER}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    const $controller = new Controller(ctx, next);
    const action = typeof $controller[ctx.ACTION] == 'function' ? ctx.ACTION : 'empty';

    if (ctx.ACTION[0] == '_' || ctx.ACTION == 'empty' || typeof $controller[action] != 'function') {
        if (cfg_app.app_debug) {
            ctx.body = `方法:${ctx.APP}/${type}/${ctx.CONTROLLER}/${ctx.ACTION}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    // 控制器中间件
    const middlewares = Array.isArray($controller['middleware'])
        && $controller['middleware'].length > 0
        && $controller['middleware'].reduce((stack, middle) => {
                typeof middle == 'string' && (middle = {middleware: middle});
                if(Array.isArray(middle.except) ? ~middle.except.indexOf(ctx.ACTION) : ~[middle.except].indexOf(ctx.ACTION)) {
                    return stack;
                }
                if(middle.accept && (Array.isArray(middle.accept) ? !~middle.accept.indexOf(ctx.ACTION) : !~[middle.accept].indexOf(ctx.ACTION))) {
                    return stack;
                }
                return stack.concat(async (ctx, next) => {
                    const [METHOD = ctx.ACTION, MIDDLEWARE = ctx.CONTROLLER, APP = ctx.APP] = middle.middleware.split('/').reverse();
                    if(!ctx.$[APP]) {
                        if(cfg_app.app_debug) {
                            ctx.body = `应用:${APP}不存在！`;
                            logger.log(ctx.body);
                        }
                        return;
                    }
                    if(!ctx.$[APP]['middleware']) {
                        if(cfg_app.app_debug) {
                            ctx.body = `中间件目录:${APP}/middleware不存在！`;
                            logger.log(ctx.body);
                        }
                        return;
                    }
                    const Middleware = ctx.$[APP]['middleware'][MIDDLEWARE];
                    if(!Middleware || typeof Middleware != 'function') {
                        if(cfg_app.app_debug) {
                            ctx.body = `中间件文件:${APP}/middleware/${MIDDLEWARE}不存在！`;
                            logger.log(ctx.body);
                        }
                        return;
                    }
                    const $middleware = new Middleware(ctx, next);
                    if(!$middleware[METHOD] || typeof $middleware[METHOD] != 'function') {
                        if(cfg_app.app_debug) {
                            ctx.body = `中间件方法:${APP}/middleware/${MIDDLEWARE}/${METHOD}不存在！`;
                            logger.log(ctx.body);
                        }
                        return;
                    }

                    // 执行中间件方法
                    await $middleware[METHOD]();
                });
            }, [])
        || [];

    // 执行控制器方法
    await compose(middlewares)(ctx, async () => {
        let result;
        typeof $controller['_init'] == 'function' && (result = await $controller['_init']());
        result !== false && (result = await $controller[action]());
        result !== false && typeof $controller['_end'] == 'function' && await $controller['_end']();
    });
}

module.exports = run;