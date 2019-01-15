const path = require('path');
const fs = require('fs');
const engine = {};
class View {
    constructor(ctx, next) {
        this.ctx = ctx;
        this.next = next;
        this.config = ctx.loader.config.app;
        this._file = '';
        this._data = {};
        this._html = 'hello iijs !';
    }

    //获取模版内容
    load(template){
        let view_file = '';
        template = template || this.ctx._action;
        if(path.extname(template)){
            view_file = template;
        }else{
            temp = template.trim('/').split('/');
            switch(temp.length){
                case 1:
                    view_file = this.ctx._app + '/view/' + this.ctx._controller + this.config.view_depr + temp[0];
                    break;
                case 2:
                    view_file = this.ctx._app + '/view/' + temp[0] + this.config.view_depr + temp[1];
                    break;
                case 3:
                    view_file = temp[0] + '/view/' + temp[1] + this.config.view_depr + temp[2];
                    break;
                default:
                    view_file = template;
            }
            view_file += this.config.view_suffix;
        }
        template = template.split('/');

        view_file = path.join(__dirname, '../', view_file);
        if(this.config.app_debug && !fs.existsSync(view_file)){
            return this.display(`模板文件:${view_file}不存在！`);
        }
        const _BOM = /^\uFEFF/;
        this._html = fs.readFileSync(view_file).toString().replace(_BOM, '');
        this._file = view_path;
        return this;
    }

    //渲染ejs数据
    render(content){
        if(content){
            this._html = content;
            this._file = '';
        }
        this._html = this.ejs.render(this._html, this._data, {filename: this._file, cache: true});
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
        if(typeof obj_data != 'object' && this.config.app_debug){
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
        if(!engine['ejs']) engine['ejs'] = require('ejs');
        return engine['ejs'];
    }

    //md引擎
    get md(){
        if(!engine['md']) engine['md'] = require('markdown').markdown;
        return engine['md'];
    }
}

module.exports = View;