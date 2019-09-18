const fs = require('fs');

const isFileSync = (path) => {return fs.existsSync(path) && fs.statSync(path).isFile();}
const isDirSync = (path) => {return fs.existsSync(path) && fs.statSync(path).isDirectory();}

const readFile = (path, type='string') => {
    return new Promise(function(resolve, reject) {
        fs.readFile(path, function(err, data) {
            if(err) reject(type == 'string' ? err.toString() : err);
            else resolve(type == 'string' ? data.toString().replace(/^\uFEFF/, '') : data);
        });
    });
}

module.exports = {isFileSync, isDirSync, readFile, get ii(){return require('noader')}, get md(){return require('markdown-it')}};