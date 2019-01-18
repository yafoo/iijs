async function run(ctx, next, type='controller') {
    const config = ctx.loader.config.app;

    //应用、控制器、方法名字验证
    if (~ctx._app.indexOf('.') || ~ctx._controller.indexOf('.') || ~ctx._action.indexOf('.')) {
        if (config.app_debug == true) {
            ctx.body = `应用、控制器或方法名字不合法！`;
            console.log(ctx.body);
        }
        return;
    }

    if (!ctx.loader[ctx._app]) {
        if (config.app_debug) {
            ctx.body = `应用:${ctx._app}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if (!ctx.loader[ctx._app][type]) {
        if (config.app_debug) {
            ctx.body = `目录:${ctx._app}/${type}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if(type == 'view' && config.view_depr != '/') {
        //输出模版文件内容
        const content = await ctx.loader[ctx._app][type].readFile(ctx._controller + config.view_depr + ctx._action + config.view_ext);
        if(!content && config.app_debug) {
            ctx.body = `模板文件:${ctx._app}/${type}/${ctx._controller + config.view_depr + ctx._action + config.view_ext}不存在！`;
            console.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    if (!ctx.loader[ctx._app][type][ctx._controller]) {
        if (config.app_debug) {
            ctx.body = `文件或模板目录:${ctx._app}/${type}/${ctx._controller}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if(type == 'view') {
        //输出模版文件内容
        const content = await ctx.loader[ctx._app][type].file(ctx._action + config.view_ext);
        if(!content && config.app_debug) {
            ctx.body = `模板文件:${ctx._app}/${type}/${ctx._controller}/${ctx._action + config.view_ext}不存在！`;
            console.log(ctx.body);
            return;
        }
        ctx.body = content;
        return;
    }

    if (typeof ctx.loader[ctx._app][type][ctx._controller][ctx._action] != 'function') {
        if (config.app_debug) {
            ctx.body = `方法:${ctx._app}/${type}/${ctx._controller}/${ctx._action}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    //执行控制器方法
    await ctx.loader[ctx._app][type][ctx._controller][ctx._action]();
}

module.exports = run;