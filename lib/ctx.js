const Ctx = new Proxy(class {}, {
      construct(Cls, args, newCls) {
            /* method 1: */
            // class Class {};
            // Class.prototype.constructor = newCls;
            // Class.prototype.__proto__ = newCls.prototype;
            // const obj = new Class(...args);

            /* method 2: */
            // class Class {};
            // const obj = new Class(...args);
            // obj.__proto__ = newCls.prototype;

            /* method 3: */
            // const obj = {};
            // obj.__proto__ = newCls.prototype;

            /* simple 3: */
            // {__proto__: newCls.prototype}

            return new Proxy({__proto__: newCls.prototype}, {
                get: (target, prop) => {
                    if(prop in target || typeof prop == 'symbol' || prop == 'inspect'){
                        return target[prop];
                    }
                    if(prop.slice(0, 1) == '$' && target.ctx && target.ctx.$iijs) {
                        prop = prop.slice(1);
                        const $root = target.ctx.$iijs;
                        const app = target.ctx.$app;
                        const common = $root.config.app.default_common;
                        return $root[app][prop]
                        || ($root[common] && $root[common][prop])
                        || $root[prop]
                        || (prop == 'root' && $root);
                    } else {
                        return undefined;
                    }
                }
            });
      }
  });

module.exports = Ctx;