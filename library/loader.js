const isClass = require('is-class');
const path = Symbol('load->path');

function loader(ctx, obj) {
    obj = obj || {};
    return new Proxy(obj, {
        get (target, property) {
            //if(typeof property === 'symbol') return; ??
            if(isClass(target)) return new target(ctx)[property];

            if (!(property in target)) {
                if (!target[path]) target[path] = obj.path || '../';
                try {
                    const child = require(target[path] + property + '.js');
                    isClass(child) ? target[property] = require('./loader')(ctx, child) : child;
                } catch(e) {
                    target[property] = require('./loader')(ctx);
                    target[property][path] = target[path] + property + '/';
                }
            }
            return target[property];
        },
        //??
        construct (target, args, newTarget) {
            return new target(...args);
        }
    });
}

module.exports = loader;