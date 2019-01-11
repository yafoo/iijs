const app = require('./library/app');
DEBUG = 'koa-views';
//server
app.listen(8080, '0.0.0.0', function(err){
    if(!err) console.log('server started !');
});