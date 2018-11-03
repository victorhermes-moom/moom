var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHBS = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
/*var flash = require('connect-flash');*/
var flash = require('express-flash');
var validator = require('express-validator');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');

var app = express();

mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://node-shop:node-shop@node-rest-api-shard-00-00-hcj0k.mongodb.net:27017,node-rest-api-shard-00-01-hcj0k.mongodb.net:27017,node-rest-api-shard-00-02-hcj0k.mongodb.net:27017/test?ssl=true&replicaSet=node-rest-api-shard-0&authSource=admin&retryWrites=true', {
    useMongoClient: true,
    /* other options */ 
  }
);

require('./config/passport');

// view engine setup
app.engine('.hbs', expressHBS({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(validator());
app.use(flash());
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret', 
  resave: false, 
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  res.locals.login = req.isAuthenticated();
  next();
});

app.use('/', indexRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
