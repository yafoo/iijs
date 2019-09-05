const fs = require('fs');

const isFile = (path) => {return fs.existsSync(path) && fs.statSync(path).isFile();}
const isDir = (path) => {return fs.existsSync(path) && fs.statSync(path).isDirectory();}
const readFile = (path, type='string') => {
    return new Promise(function(resolve, reject) {
        fs.readFile(path, function(err, data) {
            if(err) reject(type == 'string' ? err.toString() : err);
            resolve(type == 'string' ? data.toString().replace(/^\uFEFF/, '') : data);
        });
    });
}

module.exports = {isFile, isDir, readFile};