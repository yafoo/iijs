const cfg_app = require('./config').app;

async function run(ctx, next, type='controller') {
    const loader = ctx.loader;

    //应用、控制器、方法名字验证
    if (~ctx._app.indexOf('.') || ~ctx._controller.indexOf('.') || ~ctx._action.indexOf('.')) {
        if (cfg_app.app_debug == true) {
            ctx.body = `应用、控制器或方法名字不合法！`;
            console.log(ctx.body);
        }
        return;
    }

    if (!loader[ctx._app]) {
        if (cfg_app.app_debug) {
            ctx.body = `应用:${ctx._app}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if (!loader[ctx._app][type]) {
        if (cfg_app.app_debug) {
            ctx.body = `目录:${ctx._app}/${type}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if(type == 'view' && cfg_app.view_depr != '/') {
        //输出模版文件内容
        const content = await loader[ctx._app][type].readFile(ctx._controller + cfg_app.view_depr + ctx._action + cfg_app.view_ext);
        if(!content && cfg_app.app_debug) {
            ctx.body = `模板文件:${ctx._app}/${type}/${ctx._controller + cfg_app.view_depr + ctx._action + cfg_app.view_ext}不存在！`;
            console.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    if (!loader[ctx._app][type][ctx._controller]) {
        if (cfg_app.app_debug) {
            ctx.body = `文件或模板目录:${ctx._app}/${type}/${ctx._controller}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if(type == 'view') {
        //输出模版文件内容
        const content = await loader[ctx._app][type].file(ctx._action + cfg_app.view_ext);
        if(!content && cfg_app.app_debug) {
            ctx.body = `模板文件:${ctx._app}/${type}/${ctx._controller}/${ctx._action + cfg_app.view_ext}不存在！`;
            console.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    if (typeof loader[ctx._app][type][ctx._controller][ctx._action] != 'function') {
        if (cfg_app.app_debug) {
            ctx.body = `方法:${ctx._app}/${type}/${ctx._controller}/${ctx._action}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    //执行控制器方法
    await loader[ctx._app][type][ctx._controller][ctx._action]();
}

module.exports = run;