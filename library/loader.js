const isClass = require('is-class');

function load(dir, ...args) {
    const loader = {};
    const cache = {};
    const path = Symbol('load#path');
    loader[path] = (dir && dir.charAt(dir.length-1) == '/' ? dir : dir + '/') || require('path').pathname(module.parent.filename) + '/';
    return creatLoader(loader);

    function creatLoader(obj={}) {
        return new Proxy(obj, {
            get (target, property) {
                if (isClass(target)) {
                    if (!cache[target[path]]) cache[target[path]] = new target(...args);
                    if(property == 'instance') return cache[target[path]];
                    return cache[target[path]][property];
                }
                if (!(property in target)) {
                    try {
                        const child = require(target[path] + property + '.js');
                        isClass(child) ? target[property] = creatLoader(child) : child;
                    } catch(e) {
                        target[property] = creatLoader();
                    }
                    target[property][path] = target[path] + property + '/';
                }
                return target[property];
            },
            construct (target, args) {
                return new target(...args);
            }
        });
    }
}

function middle(dir, name='load') {
    return async (ctx, next) => {
        ctx[name] = load(dir, ctx, next);
        await next();
    }
}

module.exports = {load, middle};