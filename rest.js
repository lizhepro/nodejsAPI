var http = require('http');
var https = require('https');


exports.getJSON = function(options, onResult) {
  console.log('rest::getJSON(%s)', options.path);

  var prot = options.port == 433 ? https : http;
  var req = prot.request(options, function(res) {
    var output = '';

    res.setEncoding('utf-8');

    res.on('data', function(chunk) {
      output += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(output);
      onResult(res, obj);
    });

  });

  req.end();

};
