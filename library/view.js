const path = require('path');
const fs = require('fs');

class View {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
        this._file = '';
        this._data = {};
        this._html = 'hello iijs !';
        this._ejs = null;
        this._md = null;
    }

    //获取模版内容
    load(template){
        let view_file = '';
        template = template || this.ctx.state.action;
        template = template.split('/');
        
        for(let i=0; i<template.length; i++){
            if(i == template.length-1 && !~template[i].indexOf('.')){
                template[i] += '.' + this.ctx.state.config.view_suffix;
                view_file += this.ctx.state.config.view_depr + template[i];
            }else{
                view_file += '/' + template[i];
            }
        }
        if(template.length == 1) view_file = this.ctx.state.controller + view_file;
        if(template.length < 2 && this.ctx.state.config.app_multi_module) view_file = this.ctx.state.module + '/' + view_file;

        const view_path = path.join(__dirname, '../view', view_file);
        if(this.ctx.state.config.app_debug && !fs.existsSync(view_path)){
            console.log(view_path, view_file);
            return this.display(`模块文件:${view_path}不存在！`);
        }
        const _BOM = /^\uFEFF/;
        this._html = fs.readFileSync(view_path).toString().replace(_BOM, '');
        this._file = view_path;
        return this;
    }

    //渲染ejs数据
    render(content){
        if(content){
            this._html = content;
            this._file = '';
        }
        this._html = this.ejs.render(this._html, this._data, {filename: this._file});
        return this;
    }

    //解析markdown
    markdown(content){
        if(content){
            this._html = content;
            this._file = '';
        }
        this._html = this.md.toHTML(this._html);
        return this;
    }

    //直接内容输出
    display(content){
        if(content) this._html = content;
        this.ctx.body = this._html;
    }

    //快捷使用
    fetch(template){
        this.load(template).render().display();
    }

    //赋值模版数据
    assign(name, value){
        this._data[name] = value;
        return this;
    }

    //获取或设置模版数据
    data(obj_data){
        if(!obj_data) return this._data;
        if(typeof obj_data != 'object' && this.ctx.state.config.app_debug){
            this.display(`${obj_data}必需为json对象！`);
        }else{
            this._data = obj_data;
            return this;
        }
    }

    //获取html代码
    html(){
        return this._html;
    }

    //ejs引擎
    get ejs(){
        if(!this._ejs) this._ejs = require('ejs');
        return this._ejs;
    }

    //md引擎
    get md(){
        if(!this._md) this._md = require('markdown').markdown;
        return this._md;
    }
}

module.exports = View;