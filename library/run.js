async function run(ctx, next) {
    //生成应用、控制器、方法名字
    const config = ctx.loader.config.app;
    ctx._app = ctx._app || ctx.params._app || (config.app_multi ? config.default_app : config.default_controller);
    ctx._controller = ctx._controller || ctx.params._controller || (config.app_multi ? config.default_controller : config.default_action);
    ctx._action = ctx._action || ctx.params._action || config.default_action;

    delete ctx.params._app;
    delete ctx.params._controller;
    delete ctx.params._action;

    if(!config.app_multi){
        ctx._action = ctx._controller;
        ctx._controller = ctx._app;
        ctx._app = config.default_app;
    }

    //应用、控制器、方法名字验证
    if ((config.app_multi && ~ctx._app.indexOf('.')) || ~ctx._controller.indexOf('.') || ~ctx._action.indexOf('.')) {
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

    if (!ctx.loader[ctx._app]['controller'] || !ctx.loader[ctx._app]['controller'][ctx._controller]) {
        if (config.app_debug) {
            ctx.body = `控制器:${ctx._app}/${ctx._controller}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    if (typeof ctx.loader[ctx._app]['controller'][ctx._controller][ctx._action] != 'function') {
        if (config.app_debug) {
            ctx.body = `控制器方法:${ctx._app}/${ctx._controller}/${ctx._action}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    //执行控制器方法
    await ctx.loader[ctx._app]['controller'][ctx._controller][ctx._action]();
}

module.exports = run;