const path = require('path');
const helper = require('./helper');
const cfg_app = require('./config').app;
const engine = {};

class View {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
        this._engine = cfg_app.view_engine;
        this._data = {};
    }

    //直接内容输出
    async display(content){
        this.ctx.body = content;
    }

    //直接文件输出
    async load(template, html=false){
        const temp_file = this.parsePath(template);
        const content = await helper.readFile(temp_file);
        if(html) return content;
        else this.ctx.body = content;
    }

    //渲染内容输出
    async render(content, html=false){
        content = this[this._engine]['render'](content, this._data);
        if(html) return content;
        else this.ctx.body = content;
    }

    //渲染文件输出
    async fetch(template, html=false){
        const temp_file = this.parsePath(template);
        const content = await this[this._engine]['renderFile'](temp_file, this._data, {filename: temp_file, cache: cfg_app.app_debug});
        if(html) return content;
        else this.ctx.body = content;
    }

    //赋值模版数据
    assign(name, value){
        this._data[name] = value;
    }

    //获取模版数据
    data(name){
        if(name) return this._data[name];
        else return this._data;
    }

    //设置模版引擎
    engine(value){
        this._engine = value;
    }

    //解析模板地址
    parsePath(template){
        let view_file = '';
        template = (template && template.trim('/')) || this.ctx.$action;
        if(path.extname(template)){
            view_file = template;
        }else{
            const temp = template.split('/');
            switch(temp.length){
                case 1:
                    view_file = this.ctx.$app + '/view/' + this.ctx.$controller + cfg_app.view_depr + temp[0];
                    break;
                case 2:
                    view_file = this.ctx.$app + '/view/' + temp[0] + cfg_app.view_depr + temp[1];
                    break;
                case 3:
                    if(cfg_app.app_multi){
                        view_file = temp[0] + '/view/' + temp[1] + cfg_app.view_depr + temp[2];
                        break;
                    }
                default:
                    view_file = template;
            }
            view_file += cfg_app.view_ext;
        }
        view_file = path.join(this.ctx.$ii.$path, './', view_file);
        return view_file;
    }

    //ejs引擎
    get ejs(){
        if(!engine.ejs) engine.ejs = require('ejs');
        return engine.ejs;
    }

    //art引擎
    get art(){
        if(!engine.art) engine.art = {renderFile: require('art-template')};
        engine.art.render = engine.art.renderFile.render;
        return engine.art;
    }

    //md引擎
    get md(){
        if(!engine.md) engine.md = require('markdown-it')();
        return engine.md;
    }
}

module.exports = View;