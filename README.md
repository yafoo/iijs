# iijs
A simple and lightweight MVC framework built on nodejs+koa2

#### 项目介绍

一个基于nodejs+koa2构建的简单轻量级MVC框架

官网：[js.i-i.me](https://js.i-i.me/ "iijs") 源码：[github.com/yafoo/iijs](https://github.com/yafoo/iijs "github")
	

#### 使用说明

1. [iijs官网](https://js.i-i.me/ "iijs官网")
2. [iijs手册](https://js.i-i.me/doc "iijs手册")
3. [hello world](https://js.i-i.me/hello "hello world")

#### 其他

1. [爱主页](https://www.i-i.me/ "爱主页 - 网址收藏分享平台！")
2. [iicms](https://cms.i-i.me/ "iicms内容管理系统")
3. [码云](https://gitee.com/yafu "码云")
4. 联系我，QQ：331406669

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