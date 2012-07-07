var http = require('http');

exports.getResponse = function(options, onResult) {
    var req = http.request(options, function(res) {
        var output = '';

        console.log('start grab %s', options.path);

        res.setEncoding('utf-8');

        res.on('data', function(chunk) {
            output += chunk;
        });

        res.on('end', function() {
            onResult(res, output);
        });

        req.end();
    });

    req.on('error', function(err) {
        console.log(err.stack);
    });

    req.end();
};
