module.exports = new Proxy({}, {
    get: (target, prop) => {
        if(prop in target || typeof prop == 'symbol' || prop == 'inspect'){
            return target[prop];
        }
        const folder = prop == 'utils' ? 'utils' : 'lib';
        return require('./' + folder + '/' + prop.toLowerCase());
    }
});