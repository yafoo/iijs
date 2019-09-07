module.exports = new Proxy({}, {
    get: (target, prop) => {
        if(prop in target || typeof prop == 'symbol'){
            return target[prop];
        }
        return require('./lib/' + prop.toLowerCase());
    }
});