$(document).ready(function() {
  var searchInput = $('#searchinput');
  var apiDescDiv = $('#api-desc');
  var apiNameDiv = $('#api-name');
  var apiSignatureDiv = $('#api-signatures');
  var apiNavigationDiv = $('#api-navigation');
  var apiContentDiv = $('#api-content');
  var API_VERSION = $('#apiVersion').val();
  var welcomeDiv = $('#welcome');
  var btnChangelog = $('#btn-changelog');
  var modalChangelog = $('#changelog');
  var apiList;
  var rFileExt = /\.json$/;


  var JSON_DIR = '/json/' + API_VERSION;
  $.getJSON(JSON_DIR + '/mydata.json', function(data) {
    apiList = data;
    load(data);
    searchInput.focus();
  });

  btnChangelog.on('click', function() {
    modalChangelog.modal({
      keyboard: true
    });
  });

  $(window).mousewheel(function(event, delta, deltaX, deltaY) {
    clearTimeout($.data(this, 'timer'));
    $.data(this, 'timer', setTimeout(function() {
      if(apiContentDiv.height() + 88 < $(window).height() ||
      delta === 1) {
        apiContentBottom = apiContentDiv.height() + 88;

        apiContentDiv
        .stop()
        .animate({
          'margin-top': $(window).scrollTop()
        }, 'fast');
      }
    }, 250));
  });

  function sortApiObject(apiObj) {
    var sortedApiObject = {};
    var apiNameList = Object.keys(apiObj);
    for(var i=0, apiName; apiName=apiNameList[i]; i++) {
      var obj = apiObj[apiName];
      var objType = obj.type;
      if(!obj.type) continue;
      !sortedApiObject[objType] ? sortedApiObject[objType] = {} : null;
      sortedApiObject[objType][apiName] = obj;
    }
    return sortedApiObject;
  }

  function updateApiNavigation(sortedApiObject, owner) {
    var fragment = document.createDocumentFragment();
    var $liBack = $('<li />')
    .addClass('mouse')
    .prop('owner', owner)
    .on('click', function() {
      loadApiNavigation(apiList);
    });
    var $iBack = $('<i />')
    .addClass('icon-circle-arrow-left');
    var $textBack = 'go back';
    $liBack.append($iBack).append($textBack);
    fragment.appendChild($liBack[0]);


    var apiTypeKeys = Object.keys(sortedApiObject);

    var apiData;
    for(var i=0, apiType; apiType=apiTypeKeys[i]; i++) {
      var oneApiTypeObj = sortedApiObject[apiType];
      var $apiTypeLiHeader = $('<li />')
      .addClass('nav-header')
      .text(apiType);
      fragment.appendChild($apiTypeLiHeader[0]);
      var apiNameList = Object.keys(oneApiTypeObj);
      for(var j=0, apiName; apiName=apiNameList[j]; j++) {
        var $li = $('<li />');
        var $a = $('<a />')
        .addClass('mouse')
        .text(apiName.replace(/\([^)]*\)/, ''))
        .prop({
          apiObj: oneApiTypeObj[apiName]
        , owner: owner
        })
        .on('click', function() {
          var apiObj = $(this).prop('apiObj');
          if(apiData) {
            updateApiContent(getValueByPath(apiData, apiObj.path));
          } else {
            $.getJSON(JSON_DIR + '/' + $(this).prop('owner'),
            function(data) {
              apiData = data;
              updateApiContent(getValueByPath(apiData, apiObj.path));
            });
          }
        });

        $li.append($a);
        fragment.appendChild($li[0]);
      }
    }
    apiNavigationDiv.find('ul').empty().append(fragment);

    document.body.scrollIntoView();

    apiContentDiv
    .animate({
      'margin-top': 0
    }, 'fast');
  }

  function loadApiNavigation(apiList) {
    var fragment = document.createDocumentFragment();
    var $liHeader = $('<li />')
    .addClass('nav-header')
    .text('Table of Contents');
    fragment.appendChild($liHeader[0]);

    var apiFileNameList = Object.keys(apiList).sort();
    for(var i=0, apiFileName; apiFileName=apiFileNameList[i]; i++) {
      var $li = $('<li />');
      var $a = $('<a />')
      .addClass('mouse')
      .text(apiFileName.replace(rFileExt, ''))
      .prop({
        apiObj: apiList[apiFileName]
      , owner: apiFileName
      })
      .on('click', function() {
        var sortedApiObject = sortApiObject($(this).prop('apiObj'));
        updateApiNavigation(sortedApiObject, $(this).prop('owner'));
      });

      $li.append($a);
      fragment.appendChild($li[0]);
    }
    apiNavigationDiv.find('ul').empty().append(fragment);
  }

  function updateApiContent(value) {
    welcomeDiv.hide();
    apiNameDiv.find('h3').html(value.textRaw);
    apiSignatureDiv.html(generateSignatureHtml(value));
    apiDescDiv.html(value.desc || '');

    $(window).trigger('mousewheel');

    //code highlight
    $('code').parent('pre').addClass('prettyprint');
    prettyPrint();
  }

  function load(apiList) {
    //load api navigation
    loadApiNavigation(apiList);

    //load typeahead
    var autocomplete = searchInput.typeahead({
      updater: function(item) {
        var apiObj = JSON.parse(item);
        var itemName = apiObj.item;
        var itemPath;
        var apiFileNameList = Object.keys(apiList);
        //获取用户输入api名称对应的路径
        for(var i=0, apiFileName; apiFileName=apiFileNameList[i]; i++) {
          if(itemPath) break;
          var apiFileJSON = apiList[apiFileName];
          var apiNameList = Object.keys(apiFileJSON);
          for(var j=0, apiName; apiName=apiNameList[j]; j++) {
            if(apiName === itemName &&
            apiFileName === apiObj.owner) {
              itemPath = apiFileJSON[apiName].path;
              break;
            }
          }
        }


        //通过api的owner和path获取api对象
        $.getJSON(JSON_DIR + '/' + apiObj.owner, function(data) {
          var value = getValueByPath(data, itemPath);

          updateApiContent(value);
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

          var rInput = new RegExp(escapeInput($(this).val()), 'i');
          var dropDownApiList = [];
          var apiFileNameList = Object.keys(apiList);
          for(var i=0, apiFileName; apiFileName=apiFileNameList[i]; i++) {
            var apiFileJSON = apiList[apiFileName];
            var apiNameList = Object.keys(apiFileJSON);
            for(var j=0, apiName; apiName=apiNameList[j]; j++) {
              if(rInput.test(apiName)) {
                dropDownApiList.push(JSON.stringify({
                  item: apiName,
                  type: apiFileJSON[apiName].type,
                  owner: apiFileName
                }));
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
  }

  /*
  * 通过路径获取对象
  */
  var getValueByPath = function(obj, path) {
    var pathList = path.split('.');
    var k;
    while(k = pathList.shift()) {
      obj = obj[k];
    }
    return obj;
  };

  /*
  * 获取api的参数名称
  */
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

  /*
  * 生成api参数信息html
  */
  var generateParamInfoHtml = function(params) {
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

  /*
  * 生成signature html
  */
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
        returnHtml += generateParamInfoHtml(signatureParams);
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

  /*
  * 对输入的文本进行转义
  */
  var escapeInput = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  };

});
