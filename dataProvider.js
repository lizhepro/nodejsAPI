var http = require('http');
var rest = require('./rest');
var async = require('async');
var jsonSearch = require('./json-search');

const NODEJS_HOST = 'nodejs.org';
const NODEJS_PORT = 80;



var getOptions = function(contentUrl) {
  var url = contentUrl || 'index.json';
  return {
    host: NODEJS_HOST,
    port: NODEJS_PORT,
    path: '/api/' + url,
    method: 'GET'
  };
};


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

var getApiContentUrl = function(item) {
  if(!item) return null;
  var contentUrl = null;
  if(item.type == 'text') {
    if(item.text.toLowerCase() == 'appendixes') {
      return false;
    }
    var itemText = item.text;

    contentUrl = itemText.substring(
      itemText.indexOf('(') + 1,
      itemText.indexOf(')')
    ).replace(/html$/, 'json');
  }

  return contentUrl;
};

var prepareData = function(cb) {
  var indexList = {};

  rest.getJSON(getOptions(), function(res, result) {
    if(res.statusCode == 200) {
      var desc = result.desc;

      var i = 0;
      async.whilst(
        function() {
          return i < desc.length;
        },
        function(callback) {
          i++;
          var item = desc[i];
          var contentUrl = getApiContentUrl(item);
          if(contentUrl) {
            rest.getJSON(getOptions(contentUrl), function(res, result) {
              if(res.statusCode == 200) {
                extractApiObject(result, indexList);
                callback();
              };
            });
          } else {
            callback();
          }
        }, function(err) {
          console.log('%d data prepare completed!!!', i);
          cb(null, indexList);
        }
      );
    }
  });
};

module.exports.prepareData = prepareData;
