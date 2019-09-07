# iijs
A simple and lightweight MVC framework built on nodejs+koa2

### 项目介绍

一个基于nodejs+koa2构建的简单轻量级MVC框架

官网：[js.i-i.me](https://js.i-i.me/ "iijs")
　源码：[github](https://github.com/yafoo/iijs "github") [码云](https://gitee.com/yafu/iijs "码云")
　QQ：`331406669`
	

### 使用

1. 安装 `npm i iijs`

### 应用结构

```
├── app             //应用目录 （非必需，可更改）
|  ├── Controller   //控制器目录 （非必需，可更改）
|  |  └── index.js  //控制器
|  ├── view         //模板目录 （非必需，不可更改）
|  |  └── index     //index控制器模板目录 （非必需，可更改）
|  |     └── index.htm //模板
|  ├── model        //模型目录 （非必需，可更改）
|  ├── logic        //逻辑目录 （非必需，可更改）
|  └── ****         //其他目录 （非必需，可更改）
├── app2            //应用2目录 （非必需，可更改）
├── common          //公共应用目录 （非必需，可更改）
├── config          //配置目录 （非必需，不可更改）
|  ├── app.js       //APP配置 （非必需，不可更改）
|  ├── route.js     //路由配置 （非必需，不可更改）
|  └── ****         //其他配置 （非必需，可更改）
├── public          //静态访问目录 （非必需，可更改）
|  └── static       //css image文件目录 （非必需，可更改）
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
const {Controller} = require('iijs');

class index extends Controller {
    async index() {
        await this.display(`<div style="font-size:50px;">hello iijs, hello world !</div>`);
    }
}

module.exports = index;
```

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