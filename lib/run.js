const path = require('path');
const {readFile} = require('../utils/fs');
const cfg_app = require('./config').app;
const logger = new (require('./logger'))();

async function run(ctx, next, type=cfg_app.controller_folder) {
    //应用、控制器、方法名字验证
    if (~ctx.$app.indexOf('.') || ~ctx.$controller.indexOf('.') || ~ctx.$action.indexOf('.')) {
        if (cfg_app.app_debug) {
            ctx.body = `应用、控制器或方法名字不合法！`;
            logger.log(ctx.body);
        }
        return;
    }

    if (~cfg_app.deny_apps.indexOf(ctx.$app) || !ctx.$iijs[ctx.$app]) {
        if (cfg_app.app_debug) {
            ctx.body = `应用:${ctx.$app}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    if (!ctx.$iijs[ctx.$app][type]) {
        if (cfg_app.app_debug) {
            ctx.body = `目录:${ctx.$app}/${type}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    //模版文件内容直接输出
    if(type == cfg_app.view_folder) {
        const content = await readFile(path.join(ctx.$iijs[ctx.$app][type].$path, ctx.$controller + cfg_app.view_depr + ctx.$action + cfg_app.view_ext));
        if(!content && cfg_app.app_debug) {
            ctx.body = `模板文件:${ctx.$app}/${type}/${ctx.$controller + cfg_app.view_depr + ctx.$action + cfg_app.view_ext}不存在！`;
            logger.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    if (!ctx.$iijs[ctx.$app][type][ctx.$controller]) {
        if (cfg_app.app_debug) {
            ctx.body = `文件或模板目录:${ctx.$app}/${type}/${ctx.$controller}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    const controller = ctx.$iijs[ctx.$app][type][ctx.$controller];

    if (typeof controller[ctx.$action] != 'function') {
        if (cfg_app.app_debug) {
            ctx.body = `方法:${ctx.$app}/${type}/${ctx.$controller}/${ctx.$action}不存在！`;
            logger.log(ctx.body);
        }
        return;
    }

    //执行控制器方法
    typeof controller['_init'] == 'function' && await controller['_init']();
    await controller[ctx.$action]();
    typeof controller['_end'] == 'function' && await controller['_end']();
}

module.exports = run;