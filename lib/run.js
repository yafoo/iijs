const path = require('path');
const helper = require('./helper');
const cfg_app = require('./config').app;

async function run(ctx, next, type='controller') {
    //应用、控制器、方法名字验证
    if (~ctx.$app.indexOf('.') || ~ctx.$controller.indexOf('.') || ~ctx.$action.indexOf('.')) {
        if (cfg_app.app_debug) {
            ctx.body = `应用、控制器或方法名字不合法！`;
            console.log(ctx.body);
        }
        return;
    }

    if (!ctx.$ii[ctx.$app]) {
        if (cfg_app.app_debug) {
            ctx.body = `应用:${ctx.$app}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if (!ctx.$ii[ctx.$app][type]) {
        if (cfg_app.app_debug) {
            ctx.body = `目录:${ctx.$app}/${type}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    //模版文件内容直接输出
    if(type == 'view') {
        const content = await helper.readFile(path.join(ctx.$ii[ctx.$app][type].$path, ctx.$controller + cfg_app.view_depr + ctx.$action + cfg_app.view_ext));
        if(!content && cfg_app.app_debug) {
            ctx.body = `模板文件:${ctx.$app}/${type}/${ctx.$controller + cfg_app.view_depr + ctx.$action + cfg_app.view_ext}不存在！`;
            console.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    if (!ctx.$ii[ctx.$app][type][ctx.$controller]) {
        if (cfg_app.app_debug) {
            ctx.body = `文件或模板目录:${ctx.$app}/${type}/${ctx.$controller}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if (typeof ctx.$ii[ctx.$app][type][ctx.$controller][ctx.$action] != 'function') {
        if (cfg_app.app_debug) {
            ctx.body = `方法:${ctx.$app}/${type}/${ctx.$controller}/${ctx.$action}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    //执行控制器方法
    await ctx.$ii[ctx.$app][type][ctx.$controller][ctx.$action]();
}

module.exports = run;