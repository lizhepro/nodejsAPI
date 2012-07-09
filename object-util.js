exports.extractObjectKeyPath = function(obj, key) {
  var indexList = {};
  var level = 0;
  var path = [];
  var iterObject = function(obj, key) {
    var myKeys = Object.keys(obj);
    for (var i = 0, k; k = myKeys[i]; i++) {
      var v = obj[k];
      if (typeof v === 'object') {
        path[level] = k;
        level++;
        iterObject(v, key);
      } else if (typeof v === 'string') {
        if (k === key) {
          var currentPath = path.slice(0, level);
          indexList[v] = {
            p: currentPath.join('.'),
            t: obj.type
          };
        }
      }
    }
    level--;
  };
  iterObject(obj, key);
  return indexList;
};

exports.getValueByPath = function(obj, path) {
  var pathList = path.split('.');
  var k;
  while(k = pathList.shift()) {
    obj = obj[k];
  }
  return obj;
};
