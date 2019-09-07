const app = {
    app_debug: false,
    app_multi: true, //是否开启多应用

    default_app: 'app', //默认应用
    default_controller: 'index', //默认控制器
    default_action: 'index', //默认方法
    
    view_engine: 'art', //默认模版引擎，内置（ejs, art）
    view_depr: '/', //模版文件名分割符，'/'代表二级目录
    view_ext: '.htm', //模版后缀

    static_dir: './public' //静态文件目录，相对于应用根目录
}

module.exports = app;