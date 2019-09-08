# iijs
A simple and lightweight MVC framework built on nodejs+koa2

### 项目介绍

一个基于nodejs+koa2构建的简单轻量级MVC框架，最低依赖仅仅koa和koa-router

官网：[js.i-i.me](https://js.i-i.me/ "iijs")
　源码：[github](https://github.com/yafoo/iijs "github") [码云](https://gitee.com/yafu/iijs "码云")
　QQ：`331406669`
	

### 使用

1. 安装 `npm i iijs`

### 应用结构

```
├── app             //应用目录 （非必需，可更改）
│  ├── Controller   //控制器目录 （非必需，可更改）
│  │  └── index.js  //控制器
│  ├── view         //模板目录 （非必需，可更改）
│  │  └── index     //index控制器模板目录 （非必需，可更改）
│  │     └── index.htm //模板
│  ├── model        //模型目录 （非必需，可更改）
│  ├── logic        //逻辑目录 （非必需，可更改）
│  └── ****         //其他目录 （非必需，可更改）
├── app2            //应用2目录 （非必需，可更改）
├── common          //公共应用目录 （非必需，可更改）
├── config          //配置目录 （非必需，不可更改）
│  ├── app.js       //APP配置 （非必需，不可更改）
│  ├── route.js     //路由配置 （非必需，不可更改）
│  └── ****         //其他配置 （非必需，可更改）
├── public          //静态访问目录 （非必需，可更改）
│  └── static       //css image文件目录 （非必需，可更改）
├── node_modules    //nodejs模块目录
├── server.js       //应用入口文件 （必需，可更改）
└── package.json    //npm package.json
```

### 应用入口

```js
// server.js
const {app} = require('iijs');

app.listen(3000, '127.0.0.1', function(err){
    if(!err) console.log('http server is ready on 3000');
});
```

### Hello world !

```js
// app/controller/index.js
class Index {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
    }

    async hello() {
        this.ctx.body = `hello iijs, hello world !`;
    }
}

module.exports = Index;
```

访问URL：`http://localhost/app/index/hello`

输出结果：`hello iijs, hello world !`

如果关闭多应用模式，可以省去url中的app

```js
// config/app.js
{
    app_multi: false, //是否开启多应用
}
````

URL地址变为：`http://localhost/index/hello`


配置路由文件，可以进一步简化url访问

```js
// config/route.js
[
    {url: '/hello', path: 'index/hello', method: 'get'}
]
````

URL地址变为：`http://localhost/hello`

>注意：多应用模式下，路由配置path参数需要加上应用名字，即app/index/hello

### 控制器

#### 为了方便使用，可以继承系统控制器

```js
// app/controller/index.js
const {Controller} = require('iijs');

class Index extends Controller {
    async index() {
        await this.fetch();
    }
}

module.exports = Index;
```

访问URL：`http://localhost/`

>注意：系统会自动定位默认应用、默认控制器、默认方法

控制器fetch方法，会自动渲染当前应用、控制器、方法对应的模板文件：

`app/view/index/index.htm`

也可以指定模板文件

```js
await this.fetch('list'); // app/view/index/list.htm
await this.fetch('article/index'); // app/view/article/index.htm
await this.fetch('app2/article/index'); // app2/view/article/index.htm

await this.fetch('list.html'); // /list.html
await this.fetch('app2/article/index/list'); // /app2/article/index/list.htm
```

>注意：当fetch参数字符串包含后缀或者目录超过3级，将自动按照应用的根目录地址获取模板文件

当fetch，第二个参数为true时，会直接返回渲染后的内容
```js
const html = await this.fetch(null, true);
```

除了fetch，还有三个方法

```js
await this.display(content); //直接内容输出
await this.load(template); //直接文件输出
await this.render(content); //渲染内容输出
```

#### 控制器模板数据赋值读取

使用assign方法赋值，data方法读取

```js
//赋值模版数据
this.assign(name, value);

//获取模版数据,name为空时，获取所有数据
this.data(name);
```

#### 在控制器中获取视图实例

```js
this.view; //视图实例
this.view.art; //art-template模板引擎
this.view.ejs; //ejs模板引擎
this.view.md; //markdown-it实例
```

>注意：系统控制器里的视图实例和模板引擎实例，都是按需懒加载的，可以放心使用，建议应用控制器都继承系统控制器。

### 应用配置文件

```js
// config/app.js
const app = {
    app_debug: true, //调试模式
    app_multi: true, //是否开启多应用

    default_app: 'app', //默认应用
    default_controller: 'index', //默认控制器
    default_action: 'index', //默认方法

    deny_apps: ['common'], //禁止访问应用
    controller_folder: 'controller', //控制器目录名
    view_folder: 'view', //模板目录名
    
    view_engine: 'art', //默认模版引擎，内置（ejs, art）
    view_depr: '_', //模版文件名分割符，'/'代表二级目录
    view_ext: '.htm', //模版后缀

    static_dir: './public', //静态文件目录，相对于应用根目录，为空或false时，关闭静态访问

    koa_body: {} //koa-body参数，默认禁止文件上传
}

module.exports = app;
```

### 路由配置文件

```js
// config/route.js
route = [
    {url: '/', path: 'app/index/index', method: 'get', type: 'controller'},
    {url: '/hello', path: 'app/index/hello', method: 'all'}
];

module.exports = route;
```

>注意：单应用模式，可以去掉path参数中的app，例如path: 'index/index'，其他可参考koa-router

>method参数：'get', 'put', 'post', 'patch', 'delete', 'del'

>type参数为任意自定义的目录名，controller和view名字可以在app.js配置文件中更改

案例：路由到应用2
```js
// config/route.js
{url: '/hello', path: 'app2/index/hello', method: 'get'}

// 执行文件app2/controller/index.js hello方法
```

案例：路由到模板（到模板时，会直接读取输出）
```js
// config/route.js
{url: '/hello', path: 'app2/index/hello', method: 'get', type: 'view'}

// 直接输出app2/view/index/hello.htm 模板内容
```

案例：路由到middleware
```js
// config/route.js
{url: '/hello', path: 'app2/index/hello', method: 'get', type: 'middleware'}

// 执行文件app2/middleware/index.js hello方法
```

案例：路由到api
```js
// config/route.js
{url: '/hello', path: 'app2/index/hello', method: 'post', type: 'api'}

// 执行文件app2/api/index.js hello方法
```

案例：路由输出hello world !
```js
// config/route.js
{url: '/hello', path: async (ctx, next) => {
    ctx.body = 'hello iijs, hello world !';
}, method: 'get'}

// 输出hello iijs, hello world !
```

### 特点

>本MVC框架极为轻量小巧，又自由灵活，使用简单，功能又足够强大，可开发简单的页面展示网站，可以开发pai接口应用，也可支撑复杂的多应用网站。你有什么意见或者好的建议，欢迎交流探讨。

### Nginx代理

```
location / {
    proxy_pass       http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### License

[MIT](LICENSE)