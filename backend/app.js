var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var indexRouter = require('./routes/index');
var galaxyRouter = require('./routes/galaxy');

var app = express();

app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/galaxy', galaxyRouter);

module.exports = app;

// secure
var appSSL = express();

appSSL.use(logger('dev'));
appSSL.use(cors())
appSSL.use(express.json());
appSSL.use(express.urlencoded({ extended: false }));
appSSL.use(cookieParser());
appSSL.use(express.static(path.join(__dirname, 'public')));

appSSL.use('/', indexRouter);
appSSL.use('/galaxy', galaxyRouter);

module.exports = appSSL;
