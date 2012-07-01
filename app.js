
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var dataProvider = require('./dataProvider');
var jsonSearch = require('./json-search');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

dataProvider.prepareData(function(err, arr) {

  app.get('/', routes.index);
  app.get('/query', function(req, res) {
    routes.query(req, res, arr);
  });


  app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
  });
});
