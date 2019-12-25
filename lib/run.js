const path = require('path');
const noader = require('noader');
const {readFile} = require('../utils/fs');
const {app: cfg_app, db: cfg_db, page: cfg_page} = require('./config');
const logger = new (require('./logger'))();

async function run(ctx, next, type=cfg_app.controller_folder) {
    // 设置根加载器
    ctx.$root = noader(path.dirname(module.parent.parent.parent.parent.filename), ctx, next);
    ctx.$root.config === undefined && (ctx.$root.config = {});
    ctx.$root.config.app = cfg_app;
    ctx.$root.config.db = cfg_db;
    ctx.$root.config.page = cfg_page;

    // 应用、控制器、方法名字验证
    if (~ctx.APP.indexOf('.') || ~ctx.CONTROLLER.indexOf('.') || ~ctx.ACTION.indexOf('.')) {
        if (cfg_app.app_debug) {
            ctx.body = `应用、控制器或方法名字不合法！`;
            logger.log(ctx.body);
        }
        return;
    }

    if (ctx.APP[0] == '_' || ~cfg_app.deny_apps.indexOf(ctx.APP) || !ctx.$root[ctx.APP]) {
        if (cfg_app.app_debug) {
            ctx.body = `应用:${ctx.APP}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    if (!ctx.$root[ctx.APP][type]) {
        if (cfg_app.app_debug) {
            ctx.body = `目录:${ctx.APP}/${type}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    // 模版文件内容直接输出
    if(type == cfg_app.view_folder) {
        const content = await readFile(path.join(ctx.$root[ctx.APP][type].$map.path, ctx.CONTROLLER + cfg_app.view_depr + ctx.ACTION + cfg_app.view_ext));
        if(!content && cfg_app.app_debug) {
            ctx.body = `模板文件:${ctx.APP}/${type}/${ctx.CONTROLLER + cfg_app.view_depr + ctx.ACTION + cfg_app.view_ext}不存在！`;
            logger.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    // 控制器
    const $controller = ctx.$root[ctx.APP][type][ctx.CONTROLLER] || ctx.$root[ctx.APP][type]['empty'];

    if (ctx.CONTROLLER[0] == '_' || ctx.ACTION == 'empty' || !$controller) {
        if (cfg_app.app_debug) {
            ctx.body = `文件或模板目录:${ctx.APP}/${type}/${ctx.CONTROLLER}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    const action = typeof $controller[ctx.ACTION] == 'function' ? ctx.ACTION : 'empty';

    if (ctx.ACTION[0] == '_' || ctx.ACTION == 'empty' || typeof $controller[action] != 'function') {
        if (cfg_app.app_debug) {
            ctx.body = `方法:${ctx.APP}/${type}/${ctx.CONTROLLER}/${ctx.ACTION}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    // 执行控制器方法
    typeof $controller['_init'] == 'function' && await $controller['_init']();
    await $controller[action]();
    typeof $controller['_end'] == 'function' && await $controller['_end']();
}

module.exports = run;