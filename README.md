# 项目更名为jj.js，并更换仓库地址：

Github：[https://github.com/yafoo/jj.js](https://github.com/yafoo/jj.js "https://github.com/yafoo/jj.js")

Gitee：[https://gitee.com/yafu/jj.js](https://gitee.com/yafu/jj.js "https://gitee.com/yafu/jj.js")

官网：[https://me.i-i.me/jjjs/](https://me.i-i.me/jjjs/ "https://me.i-i.me/jjjs/")


# iijs

![iijs](https://me.i-i.me/static/images/iijs_360.png "iijs")

A simple and lightweight MVC framework built on nodejs+koa2

## 项目介绍

一个基于nodejs+koa2构建的简单轻量级MVC框架，最低依赖仅仅koa和koa-router。


项目地址：[https://github.com/yafoo/iijs](https://github.com/yafoo/iijs "https://github.com/yafoo/iijs")

开发手册：[https://me.i-i.me/iijs/](https://me.i-i.me/iijs/ "https://me.i-i.me/iijs/")
	

## 安装

```bash
npm i iijs
```

## 基本使用

```javascript
const {app, Controller, Model, Db, Pagination, View, Ctx, Context, Logger} = require('iijs');
```

## 应用结构

```
├── app             //应用目录 （非必需，可更改）
│  ├── controller   //控制器目录 （非必需，可更改）
│  │  └── index.js  //控制器
│  ├── view         //模板目录 （非必需，可更改）
│  │  └── index     //index控制器模板目录 （非必需，可更改）
│  │     └── index.htm //模板
│  ├── model        //模型目录 （非必需，可更改）
│  ├── logic        //逻辑目录 （非必需，可更改）
│  ├── pagination   //分页目录 （非必需，可更改）
│  └── ****         //其他目录 （非必需，可更改）
├── app2            //应用2目录 （非必需，可更改）
├── common          //公共应用目录 （非必需，可更改）
├── config          //配置目录 （非必需，不可更改）
│  ├── app.js       //APP配置 （非必需，不可更改）
│  ├── db.js        //数据库配置 （非必需，不可更改）
│  ├── routes.js     //路由配置 （非必需，不可更改）
│  └── ****         //其他配置 （非必需，可更改）
├── public          //静态访问目录 （非必需，可更改）
│  └── static       //css image文件目录 （非必需，可更改）
├── node_modules    //nodejs模块目录
├── server.js       //应用入口文件 （必需，可更改）
└── package.json    //npm package.json
```

## 应用入口

```javascript
// server.js
const {app} = require('iijs');

app.run(3000, '127.0.0.1', function(err){
    if(!err) console.log('http server is ready on 3000');
});
```

## Hello world !

```javascript
// app/controller/index.js
const {Controller} = require('iijs');

class Index extends Controller {
    async index() {
        await this.display('Hello iijs, hello world !');
    }
}

module.exports = Index;
```

浏览器访问地址：`http://127.0.0.1:3000`，页面输出：`Hello iijs, hello world !`

## 使用手册

开发手册：[https://me.i-i.me/iijs/](https://me.i-i.me/iijs/ "https://me.i-i.me/iijs/")

## 应用案例

- [melog](https://me.i-i.me/melog/)

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