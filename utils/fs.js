const fs = require('fs');
const fsPromise = {};

//(读取类)
['mkdir', 'rmdir', 'readdir', 'readFile', 'copyFile', 'unlink', 'exists', 'stat'].forEach(function (item) {
    fsPromise[item] = function (pathname, copypath) {
        return new Promise(function (resolve, reject) {
            let arg = [function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data || '');
            }];
            item === 'readFile' ? arg.unshift(copypath || 'utf8') : null;
            item === 'copyFile' ? arg.unshift(copypath || '') : null;
            fs[item](pathname, ...arg)
        });
    }
});

//(写入类)
['writeFile', 'appendFile'].forEach(function (item) {
    fsPromise[item] = function (pathname, content, charset='utf8') {
        if (typeof content !== 'string') {
            content = JSON.stringify(content)
        };
        return new Promise(function (resolve, reject) {
            fs[item](pathname, content, charset, function(err, data){
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data || '');
            });
        });
    }
});

//(判断类)
fsPromise.isFileSync = (path) => {return fs.existsSync(path) && fs.statSync(path).isFile();}
fsPromise.isDirSync = (path) => {return fs.existsSync(path) && fs.statSync(path).isDirectory();}

['isFile', 'isDir'].forEach(function (item) {
    fsPromise[item] = function (pathname) {
        return new Promise(function (resolve, reject) {
            Promise.all([fsPromise.exists(pathname), fsPromise.stat(pathname)]).then((result) => {
                resolve(result[0] && (item === 'isFile' ? result[1].isFile() : result[1].isDirectory()));
            }).catch((error) => {
                reject(error);
            });
        });
    }
});

module.exports = fsPromise;