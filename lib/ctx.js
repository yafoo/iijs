const Ctx = new Proxy(class {}, {
        construct() {
            return new Proxy({__proto__: arguments[2].prototype}, {
                get: (target, prop) => {
                    if(prop in target || typeof prop == 'symbol' || prop == 'inspect'){
                        return target[prop];
                    }
                    if(prop.slice(0, 1) == '$' && target.ctx && target.ctx.$root) {
                        prop = prop.slice(1);
                        const $root = target.ctx.$root;
                        const app = target.ctx.APP;
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