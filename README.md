# iijs
A simple and lightweight MVC framework built on nodejs+koa2

#### 项目介绍

一个基于nodejs+koa2构建的简单轻量级MVC框架

官网：[js.i-i.me](https://js.i-i.me/ "iijs")

源码：[github](https://github.com/yafoo/iijs "github")　[码云](https://gitee.com/yafu/iijs "码云")
	

#### 使用说明

1. 安装 `npm i iijs`
2. [iijs手册](https://js.i-i.me/doc "iijs手册")
3. [hello world](https://js.i-i.me/hello "hello world")

#### 项目结构

```
|--- app  //应用目录
| |--- controller  //控制器目录
| | |--- index.js //控制器文件
| |--- view  //模板目录
| | |--- index  //index控制器模板目录
| | | |--- index.htm //index控制器index方法模板文件
| |--- model  //模型目录
| |--- logic  //逻辑目录
| |--- ****  //其他目录

|--- config  //配置目录
| |--- app.js  //主配置文件
| |--- ****  //其他配置文件

|--- node_modules  //nodejs模块目录

|--- public  //静态访问目录
| |--- static  //css image文件目录

|--- server.js  //应用入口文件
|--- package.json  //应用入口文件
```

#### 应用入口

```
//server.js
const {app} = require('iijs');

app.listen(3000, '127.0.0.1', function(err){
    if(!err) console.log('http server is ready on 3000');
});
```

#### 其他

1. [爱主页](https://www.i-i.me/ "爱主页 - 网址收藏分享平台！")
2. [iicms](https://cms.i-i.me/ "iicms内容管理系统")
3. 联系我，QQ：331406669

#### Nginx代理设置

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

#### License

[MIT](LICENSE)