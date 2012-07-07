var async = require('async');
var fs = require('fs');
var path = require('path');
var rest = require('./rest');
var objectUtil = require('./object-util');




var grabJSON = exports.grabJSON = function() {
    var getOptions = function(path) {
        return {
            host: 'nodejs.org',
            method: 'GET',
            path: path || '/api/index.json'
        };
    }
    rest.getResponse(getOptions(), function(response, output) {
        if(response.statusCode == 200) {
            var jsonObj = JSON.parse(output);
            var desc = jsonObj.desc;

            var jsonFileNames = [];
            for(var i=0, item; item= desc[i]; i++) {
                if(!item.text) continue;

                var matchResult = item.text.match(/\((\w+)\.\w+\)/);
                if(matchResult) {
                    jsonFileNames.push(matchResult[1].concat('.json'));
                }
            }

            var apiList = {};
            var JSON_DIR_NAME = __dirname + '/public/json/';
            var q = async.queue(function(task, callback) {
                console.log('task == ' + task);
                var path = '/api/'.concat(task);
                rest.getResponse(getOptions(path),
                function(response, output) {
                    if(response.statusCode == 200) {
                        var jsonObj = JSON.parse(output);
                        apiList[task] = objectUtil
                        .extractObjectKeyPath(jsonObj, 'textRaw');
                        fs.writeFile(JSON_DIR_NAME + task,
                            JSON.stringify(jsonObj),
                            'utf-8', function(err) {
                            if(err) {
                                console.log(err.stack);
                            }
                        });

                        callback();
                    }
                });
            }, jsonFileNames.length);

            q.drain = function() {
                var stringData = JSON.stringify(apiList);
                fs.writeFile(JSON_DIR_NAME + 'mydata.json',
                stringData, 'utf-8', function(err) {
                    if(!err) {
                        console.log('finished generate mydata.json');
                    } else {
                        console.log(err.stack);
                    }
                });
            };

            q.push(jsonFileNames, function(err) {

            });
        }
    });
};

grabJSON();

process.on('uncaughtException', function(err) {
    console.log(err.stack);
});
