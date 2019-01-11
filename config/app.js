const app = {
    app_debug: true,
    app_multi_module: true, //是否开启多模块
    deny_module_list: ['common'], //禁止访问模块
    default_module: 'home', //默认模块
    default_controller: 'index', //默认控制器
    default_action: 'index', //默认方法
    view_depr: '_', //模版文件名分割符，使用二级目录填写'path.sep'
    view_suffix: 'htm' //模版后缀
}

module.exports = app;