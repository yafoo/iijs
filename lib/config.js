const path = require('path');
const cfg = require('noader')(path.join(path.dirname(module.parent.parent.parent.filename), './config'));
const app = {
    app_debug: true, //调试模式
    app_multi: false, //是否开启多应用

    default_app: 'app', //默认应用
    default_controller: 'index', //默认控制器
    default_action: 'index', //默认方法

    deny_apps: ['common'], //禁止访问应用
    controller_folder: 'controller', //控制器目录名
    view_folder: 'view', //模板目录名
    
    view_engine: 'art', //默认模版引擎，内置（ejs, art）
    view_depr: '/', //模版文件名分割符，'/'代表二级目录
    view_ext: '.htm', //模版后缀

    static_dir: '', //静态文件目录，相对于应用根目录，为空或false时，关闭静态访问

    koa_body: false //koa-body配置参数，为false时，关闭koa-body
}

module.exports = {app: {...app, ...cfg.app}, route: cfg.route};