let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let map = require('express-sitemap');

let index = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));


app.use('/', index);

app.get('/sitemap.xml', function(req, res) {

    let sitemap = map({
        route: {
            'ALL': {
                lastmod: '2017-11-02',
                changefreq: 'weekly',
                priority: 1.0,
            }
        }
    });

    sitemap.generate4(index);

    sitemap.XMLtoWeb(res);
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // return the error page
    // console.log(err);
    res.json(err.status || 500);
    // res.render('error');
});

module.exports = app;