const fs = require('mz/fs');
const pt = require('path');
const isClass = require('is-class');
const isFile = (path) => {return fs.existsSync(path) && fs.statSync(path).isFile();}
const isDir = (path) => {return fs.existsSync(path) && fs.statSync(path).isDirectory();}

const dirs = {};

function loader(dir, ...args) {
    const box = new Map();
    const root = {};
    box.set(root, {
        path: pt.join(pt.dirname(module.parent.filename), dir || '/', './'),
        class: false
    });
    return creatLoader(root);

    function creatLoader(obj) {
        return new Proxy(obj, {
            get: (target, prop) => {
                if (prop in target) return target[prop];
                if(typeof prop == 'symbol') return;
                const box_tgt = box.get(target);
                if (box_tgt.class) {
                    if (!box_tgt.instance) box_tgt.instance = new target(...args);
                    return prop == 'instance' ? box_tgt.instance : box_tgt.instance[prop];
                }
                if (prop == 'readFile') {
                    return async (filename, type='string') => {
                        if(type == 'string') return (await fs.readFile(box_tgt.path + filename)).toString().replace(/^\uFEFF/, '');
                        else return await fs.readFile(box_tgt.path + filename);
                    }
                }
                let child = {};
                const child_path = box_tgt.path + prop + '/';
                const child_file = box_tgt.path + prop + '.js';
                if (!dirs[child_path]) {
                    if (isFile(child_file)) dirs[child_path] = 'file';
                    else if (isDir(child_path)) dirs[child_path] = 'dir';
                    else dirs[child_path] = 'none';
                }
                if (dirs[child_path] == 'file') {
                    child = require(child_file);
                } else if (dirs[child_path] != 'dir') {
                    return undefined;
                }
                box.set(child, {
                    path: child_path,
                    class: isClass(child)
                });
                return creatLoader(child);
            }
        });
    }
}

function middle(dir, name='loader') {
    return async (ctx, next) => {
        ctx[name] = loader(dir, ctx, next);
        await next();
    }
}

module.exports = {loader, middle, isClass, isFile, isDir};