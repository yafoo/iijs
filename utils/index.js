module.exports = new Proxy({}, {
    get: (target, prop) => {
        if(prop in target || typeof prop == 'symbol' || prop == 'inspect'){
            return target[prop];
        }
        return require('./' + prop);
    }
});