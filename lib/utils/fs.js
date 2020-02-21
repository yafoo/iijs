const fs = require('fs');
const pt = require('path');
const fsPromise = {};

//(读取类)
['mkdir', 'rmdir', 'readdir', 'readFile', 'copyFile', 'unlink', 'exists', 'stat'].forEach(function (item) {
    fsPromise[item] = function (pathname, copypath) {
        return new Promise(function (resolve, reject) {
            let arg = [function (err, data) {
                if (item === 'exists') {
                    return resolve(err);
                }
                if (err) {
                    return reject(err);
                }
                resolve(data || true);
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
                    return reject(err);
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
            fsPromise.exists(pathname).then((result) => {
                if (!result) {
                    resolve(result);
                } else {
                    fsPromise.stat(pathname).then((result) => {
                        resolve(item === 'isFile' ? result.isFile() : result.isDirectory());
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
});

//(多级目录生成)
fsPromise.mkdirs = async function mkdirs(path) {
    const dir = pt.dirname(path);
    if(!await fsPromise.isDir(dir)) {
        let pathtmp;
        const dirnames = dir.split(/[/\\]/);
        for(const dirname of dirnames) {
            if(pathtmp) {
                pathtmp = pt.join(pathtmp, dirname);
            } else {
                pathtmp = dirname;
            }
            if(!await fsPromise.isDir(pathtmp)) {
                const result = await fsPromise.mkdir(pathtmp)
                if (!result) {
                    throw result;
                }
            }
        }
    }
}

module.exports = fsPromise;