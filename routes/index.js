/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};


exports.query = function(req, res, arr) {
  var input = req.query['q'];
  var result = {};
  var rInput = new RegExp(input, 'i');
  for(var key in arr) {
    if(rInput.test(key)) {
      result[key] = arr[key];
    }
  }


  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));
};
