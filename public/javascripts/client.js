$(document).ready(function() {
  var searchInput = $('#searchinput');
  var apiDescDiv = $('#api-desc');
  var apiSignatures = $('#api-signatures');

  var nodeVersion = '0.8.1';

  var apiList;
  $.getJSON('/json/' + nodeVersion + '/mydata.json', function(data) {
    apiList = data;
    searchInput.focus();
  });

  var autocomplete = searchInput.typeahead({
    updater: function(item) {
      var apiObj = JSON.parse(item);
      var itemName = apiObj.item;
      var itemPath;
      var myKeys = Object.keys(apiList);
      for(var i=0, apiFileName; apiFileName=myKeys[i]; i++) {
        if(itemPath) break;
        var apiFileJSON = apiList[apiFileName];
        var apiNameKeys = Object.keys(apiFileJSON);
        for(var j=0, apiName; apiName=apiNameKeys[j]; j++) {
          if(apiName === itemName &&
          apiFileName === apiObj.owner) {
            itemPath = apiFileJSON[apiName].p;
            break;
          }
        }
      }

      $.getJSON('/json/' + nodeVersion
        + '/' + apiObj.owner, function(data) {
        var value = getValueByPath(data, itemPath);
        console.log(value);

        apiSignatures.html(generateSignatureHtml(value));
        apiDescDiv.html(value.desc);

        $('code').parent('pre').addClass('prettyprint');
        prettyPrint();
      });

      return itemName;
    }
  }).on('dblclick', function() {
    $(this).select();
  }).on('keyup', function(ev) {

    ev.stopPropagation();
    ev.preventDefault();

    if( $.inArray(ev.keyCode,[40,38,9,13,27]) === -1 ) {
      var self = $(this);

      self.data('typeahead').source = [];

      if(!self.data('active') && self.val().length > 0){

        var rInput = new RegExp($(this).val(), 'i');
        var dropDownApiList = [];
        var myKeys = Object.keys(apiList);
        for(var i=0, apiFileName; apiFileName=myKeys[i]; i++) {
          var apiFileJSON = apiList[apiFileName];
          var apiNameKeys = Object.keys(apiFileJSON);
          for(var j=0, apiName; apiName=apiNameKeys[j]; j++) {
            if(rInput.test(apiName)) {
              var obj = {
                item: apiName,
                type: apiFileJSON[apiName].t,
                owner: apiFileName
              }
              dropDownApiList.push(JSON.stringify(obj));
            }
          }
        }
        self.data('active', true);

        //set your results into the typehead's source
        self.data('typeahead').source = dropDownApiList;

        //trigger keyup on the typeahead to make it search
        self.trigger('keyup');

        self.data('active', false);
      }
    }
  });
});

var getValueByPath = function(obj, path) {
  var pathList = path.split('.');
  var k;
  while(k = pathList.shift()) {
    obj = obj[k];
  }
  return obj;
};

var getParamNames = function(params) {
  var returnNameList = [];
  for(var i=0, param; param=params[i]; i++) {
    var paramName = param.name;
    if(param.optional) {
      paramName = '[' + param.name + ']';
    }
    returnNameList.push(paramName);
  }
  return returnNameList.join(', ');
};

var getParamInfoHtml = function(params) {
  var paramInfoHtml = '';
  for(var i=0, param; param=params[i]; i++) {
    paramInfoHtml += '<li>';
    var paramInfo = param.name;
    if(param.desc) {
      paramInfo += ' ' + param.desc;
    }
    paramInfoHtml += paramInfo;
    paramInfoHtml += '</li>';
  }
  return paramInfoHtml;
};

var generateSignatureHtml = function(value) {
  var signatureList = value.signatures;
  var returnHtml = '';
  if(!signatureList) return returnHtml;

  for(var i=0,signature; signature=signatureList[i]; i++) {
    var signatureListKeys = Object.keys(signature);
    var signatureDesc = signature['desc'];
    var signatureParams = signature['params'];
    var signatureReturn = signature['return'];

    if(signatureDesc) {
      if(returnHtml.indexOf(signatureDesc) != -1) {
        continue;
      }
    }

    if(value.type === 'class') {
      returnHtml += '<h3>new ' + value.name
      + '(' + getParamNames(signatureParams) + ')' + '</h3>';
      returnHtml += '<ul>';
      returnHtml += getParamInfoHtml(signatureParams);
    } else {
      returnHtml += '<ul>';
    }
    if(signatureReturn) {
      returnHtml += '<li>' +  signatureReturn.textRaw + '</li>';
    }
    returnHtml += '</ul>';

    if(signatureDesc) {
      returnHtml += signatureDesc;
    }
  }
  return returnHtml;
};
