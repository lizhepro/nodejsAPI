/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'nodejsApi' });
};


exports.query = function(req, res, arr) {
  var input = req.query['q'];
  var result = {};
  var rInput = null;
  try{
    rInput = new RegExp(input, 'i');
  } catch(err) {
    console.log(err.toString());
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end();
    return;
  }
  var i = 0;
  for(var key in arr) {
    if(rInput.test(key)) {
      if(i++==8) break;
      result[key] = arr[key];
    }
  }

  i == 0 ? result = '' : null;

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));
};
