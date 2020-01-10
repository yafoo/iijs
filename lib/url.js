const {app: cfg_app, routes: cfg_routes} = require('./config');
const Context = require('./context');
const querystring = require("querystring");

class Url extends Context {
    build(url='', vars, ext='', domain='') {
        if(vars && typeof vars != 'object') {
            domain = ext;
            ext = vars;
            vars = {};
        }
        const query = {...vars};
        let urls;
        if(url[0] == ':') {
            url = this.ruleUrl(url.substr(1), query);
        } else if(url[0] != '/') {
            urls = url.split('/').reverse();
            if(urls.length < 3) {
                url = cfg_app.app_multi ? '/' + this.ctx.APP : '/' + this.ctx.CONTROLLER + '/' + this.ctx.ACTION
            } else {
                url = '/' + url;
            }
        }

        urls = url.split('#');
        if(~urls[0].indexOf('?')) {
            const urlss = urls[0].split('?');
            urlss[0] += ext;
            urlss[1] = urlss[1] ||'';
            if(Object.keys(query).length > 0) {
                urlss[1] = querystring.stringify({...querystring.parse(urlss[1]), ...query});
            }
            urls[0] = urlss.join('?');
        } else {
            urls[0] = urls[0] + ext;
            if(Object.keys(query).length > 0) {
                urls[0] = urls[0] + '?' + querystring.stringify(query);
            }
        }

        return domain + urls.join('#');
    }

    ruleUrl(url, query) {
        if(!cfg_routes) {
            return url;
        }

        cfg_routes.forEach(route => {
            if(route.name == url) {
                url = route.url;
                return false;
            }
        });

        if(~url.indexOf(':')) {
            url = url.replace(/\:([^./]+)/g, (reg, key) => {
                if(key in query) {
                    const value = query[key];
                    delete query[key];
                    return value;
                }
                return reg;
            });
        }

        return url;
    }
}

module.exports = Url;