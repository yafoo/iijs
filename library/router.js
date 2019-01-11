const router = require('koa-router')();
const app = require('../config/app');
const fs = require('fs');

//初始化用户路由
const route_path = __dirname + '/../config/route.js';
if(fs.existsSync(route_path)) route_bind(require(route_path), router);

//初始化MVC路由
router.all('/', async (ctx, next) => {
    await controller_run(ctx, next);
});
router.all('/:module', async (ctx, next) => {
    await controller_run(ctx, next);
});
router.all('/:module/:controller', async (ctx, next) => {
    await controller_run(ctx, next);
});
if(app.app_multi_module)
router.all('/:module/:controller/:action', async (ctx, next) => {
    await controller_run(ctx, next);
});

//初次注册路由
function route_bind(routes, router){
    const methods = ['get', 'put', 'post', 'patch', 'delete', 'del'];
    for(let route of routes){
        if(!route.method || ~methods.indexOf(route.method)) route.method = 'all';
        const paths = route.path.trim('/').split('/');
        const module = paths[0] || app.default_module;
        const controller = paths[1] || app.default_controller;
        const action = paths[2] || app.default_action;

        router[route.method](route.url, async (ctx, next) => {
            ctx.params.module = module;
            ctx.params.controller = controller;
            ctx.params.action = action;
            await controller_run(ctx, next);
        });
    }
}

//动态调用控制器
async function controller_run(ctx, next){
    ctx.state.module = ctx.params.module || app.default_module;
    ctx.state.controller = ctx.params.controller || app.default_controller;
    ctx.state.action = ctx.params.action || app.default_action;
    delete ctx.params['module'];
    delete ctx.params['controller'];
    delete ctx.params['action'];
    if(!app.app_multi_module){
        ctx.state.action = ctx.state.controller;
        ctx.state.controller = ctx.state.module;
        delete ctx.state['module'];
    }

    if((app.app_multi_module && ~ctx.state.module.indexOf('.')) || ~ctx.state.controller.indexOf('.') || ~ctx.state.action.indexOf('.')){
        return;
    }
    
    const controller_path = __dirname + '/../controller/' + (app.app_multi_module ? ctx.state.module + '/' : '') + ctx.state.controller + '.js';

    if(!fs.existsSync(controller_path)){
        if(app.app_multi_module){
            const module_path = __dirname + '/../controller/' + ctx.state.module;
            if(~app.deny_module_list.indexOf(ctx.state.module) || !fs.existsSync(module_path)){
                if(app.app_debug){
                    ctx.body = `模块:${ctx.state.module}不存在！`;
                    console.log(ctx.body);
                }
                return;
            }
        }
        if(app.app_debug){
            ctx.body = `控制器:${ctx.state.controller}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    //绑定配置
    ctx.state.config = app;

    //创建控制器实例
    const controller_class = new (require(controller_path))(ctx, next);
    
    if(!controller_class[ctx.state.action] || typeof(controller_class[ctx.state.action]) != 'function'){
        if(app.app_debug){
            ctx.body = `控制器:${ctx.state.controller}方法:${ctx.state.action}不存在！`;
            console.log(ctx.body);
        }
        return;
    }

    //执行控制器方法
    await controller_class[ctx.state.action]();
}

module.exports = router;