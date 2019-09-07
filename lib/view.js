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

    //渲染文件输出
    async fetch(template){
        const temp_file = this.parse(template);
        this.ctx.body = await this[this._engine]['renderFile'](temp_file, this._data, {filename: temp_file, cache: true});
    }

    //渲染内容输出
    async render(content){
        this.ctx.body = this[this._engine]['render'](content, this._data);
    }

    //获取文件输出
    async show(template){
        const temp_file = this.parse(template);
        this.ctx.body = await this.load(temp_file);
    }

    //直接内容输出
    async display(content){
        this.ctx.body = content;
    }

    //获取文件内容
    async load(template){
        return await helper.readFile(this.parse(template));
    }

    //赋值模版数据
    assign(name, value){
        this._data[name] = value;
        return this;
    }

    //设置模版引擎
    engine(value){
        this._engine = value;
        return this;
    }

    //解析模板地址
    parse(template){
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
        if(!engine.md) engine.md = require('markdown').markdown;
        return engine.md;
    }
}

module.exports = View;