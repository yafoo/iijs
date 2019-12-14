const path = require('path');
const cfg = require('noader')(path.join(path.dirname(module.parent.parent.parent.filename), './config'));
const app = {
    app_debug: true, //调试模式
    app_multi: false, //是否开启多应用

    default_app: 'app', //默认应用
    default_controller: 'index', //默认控制器
    default_action: 'index', //默认方法
    default_common: 'common', //默认公共应用，存放公共模型及逻辑

    deny_apps: ['common'], //禁止访问应用
    controller_folder: 'controller', //控制器目录名
    view_folder: 'view', //模板目录名
    
    view_engine: 'art', //默认模版引擎，内置（ejs, art）
    view_depr: '/', //模版文件名分割符，'/'代表二级目录
    view_ext: '.htm', //模版后缀
    view_filter: {}, //模版函数

    static_dir: '', //静态文件目录，相对于应用根目录，为空或false时，关闭静态访问

    koa_body: null //koa-body配置参数，为''、null、false时，关闭koa-body
}

const db = {
    default: {
        type      : 'mysql', // 数据库类型
        host      : 'localhsot', // 服务器地址
        database  : 'iijs', // 数据库名
        user      : 'root', // 数据库用户名
        password  : '', // 数据库密码
        port      : '', // 数据库连接端口
        charset   : 'utf8', // 数据库编码默认采用utf8
        prefix    : 'iijs_' // 数据库表前缀
    }
}

const page = {
    pageQuery  : 'query', // params 或 query
    pageKey  : 'page', // 默认分页标识，通过此字段可自动获取当前页码
    pageSize   : 15, // 默认分页大小
    pageLength : 5, // 默认分页长度，数字页码链接数量

    // 网址设置 可用参数：页码${page}
    urlPage     : '',
    urlIndex    : '',

    // 链接样式 可用参数：网址${url} 页码${page}
    linkIndex   : '<li class="index"><a href="${url}">首页</a></li>',
    linkEnd     : '<li class="end"><a href="${url}">末页</a></li>',
    linkPrev    : '<li class="prev"><a href="${url}">上一页</a></li>',
    linkNext    : '<li class="next"><a href="${url}">下一页</a></li>',
    linkList    : '<li><a href="${url}">${page}</a></li>',
    linkActive  : '<li class="active"><a href="${url}">${page}</a></li>',
    linkInfo    : '<span class="info">共${page}页，${total}条记录</span>',

    // 渲染代码
    pageRender   : '<ul class="page">${index}${prev}${list}${next}${end}</ul>${info}'
}

module.exports = {app: {...app, ...cfg.app}, db: {...db, ...cfg.db}, page: {...page, ...cfg.page}, routes: cfg.routes};