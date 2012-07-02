var async = require('async');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');





var extractApiObject = function(obj, indexList) {
  for(var key in obj) {
    if(key == 'params') continue;
    var value = obj[key];
    if(typeof(value) == 'object') {
      extractApiObject(value, indexList);
    } else if(typeof(value) == 'string') {
      if(key == 'textRaw') {
        indexList[value] = obj;
      }
    }
  }
};


var prepareData = function(cb) {
  var indexList = {};

  var jsonDirName = path.join(__dirname, 'json');

  var fileNames = wrench.readdirSyncRecursive(jsonDirName);

  var i = 0;
  var files = [];
  async.whilst(
    function() {
      return i < fileNames.length;
    },
    function(callback) {
      console.log('readding %s', fileNames[i]);
      fs.readFile(path.join(jsonDirName, fileNames[i]), 'utf-8',
      function(err, data) {
        files.push(data);
        callback(err);
      });
      i++;
    },
    function(err) {
      if(!err) {
        for(var i=0; i<files.length; i++) {
          extractApiObject(JSON.parse(files[i]), indexList);
        }
        cb(null, indexList);
      } else {
        cb(err);
      }
    }
  );
};

module.exports.prepareData = prepareData;
