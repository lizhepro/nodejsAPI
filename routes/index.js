var jsonSearch = require('../json-search');
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};


exports.query = function(req, res, arr) {
  var input = req.query['q'];

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(arr));
};
