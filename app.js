/**
* Module dependencies.
*/
var express = require('express')
, gzippo = require('gzippo')
, routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.staticCache());
  //app.use(express.static(__dirname + '/public'));
  app.use(gzippo.staticGzip(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(gzippo.staticGzip(__dirname + '/public', {maxAge: oneYear}));
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/query', function(req, res) {
  routes.query(req, res);
});


app.listen(process.env.VCAP_APP_PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


process.on('uncaughtException', function(err) {
  console.log(err.stack);
});
