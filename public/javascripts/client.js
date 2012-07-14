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
      //获取用户输入api名称对应的路径
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


      //通过api的owner和path获取api对象
      $.getJSON('/json/' + nodeVersion
        + '/' + apiObj.owner, function(data) {
        var value = getValueByPath(data, itemPath);

        apiSignatures.html(generateSignatureHtml(value));
        apiDescDiv.html(value.desc);

        var parentPath = itemPath.split('.');
        parentPath.pop();
        var parent = getValueByPath(data, parentPath.join('.'));
        updateClassNavigation(parent, itemName);



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

        var rInput = new RegExp(escapeInput($(this).val()), 'i');
        var dropDownApiList = [];
        var myKeys = Object.keys(apiList);
        for(var i=0, apiFileName; apiFileName=myKeys[i]; i++) {
          var apiFileJSON = apiList[apiFileName];
          var apiNameKeys = Object.keys(apiFileJSON);
          for(var j=0, apiName; apiName=apiNameKeys[j]; j++) {
            if(rInput.test(apiName)) {
              dropDownApiList.push(JSON.stringify({
                item: apiName,
                type: apiFileJSON[apiName].t,
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

  var updateClassNavigation = function(parent, itemName) {
    if(!parent) return false;
    var frag = document.createDocumentFragment();
    for(var i=0, child; child=parent[i]; i++) {
      var $li = $('<li />');
      var $a = $('<a />');
      var textRaw = child.textRaw;
      if(textRaw === itemName) {
        $li.addClass('active');
      }
      var methodName = textRaw.replace(/\([^)]*?\)$/, '');
      $a.text(methodName)
        .prop('apiObj', child)
        .css('cursor', 'pointer')
        .on('click', function() {
          if($(this).parent().hasClass('active')) return false;
          var obj = $(this).prop('apiObj');

          $(this).parent().siblings().removeClass('active')
            .end()
            .addClass('active');

          searchInput.val(obj.textRaw);

          apiSignatures.html(generateSignatureHtml(obj));
          apiDescDiv.html(obj.desc);

        });

      $li.append($a);
      frag.appendChild($li[0]);
    }
    $('#navigation-content').empty().append(frag);
  };

  //根据用户的地区加载social share buttons
  var userLanguage = navigator.userLanguage || navigator.language || 'en';
  if(userLanguage.indexOf('en') != -1) {
    gplusDiv = $('<div />');
    gplusDiv.addClass('g-plusone')
      .attr('data-size', 'medium');
    (function() {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/plusone.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
      })();

    twitterIframe = $('<iframe />');
    twitterIframe.attr({
      src: 'https://platform.twitter.com/widgets/tweet_button.1340179658.html#_=1342285864031&amp;count=horizontal&amp;id=twitter-widget-108&amp;lang=en&amp;original_referer=https%3A%2F%2Ftwitter.com%2Fabout%2Fresources%2Fbuttons%23tweet&amp;size=m&amp;text=NodejsAPI&amp;url=http%3A%2F%2Fnodejsapi.cloudfoundry.com%2F',
      scrolling: 'no',
      frameborder: 0,
      title: 'Twitter Tweet Button'
    }).css({
      border: 'none',
      overflow: 'hidden',
      width: '106px',
      height: '20px',
      allowTransparency: true
    }).addClass('twitter-share-button twitter-count-horizontal');

    fbIframe = $('<iframe />');
    fbIframe.attr({
      src: '//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fnodejsapi.cloudfoundry.com%2F&amp;send=false&amp;layout=button_count&amp;show_faces=true&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21"',
      scrolling: 'no',
      frameborder: 0,
      layout: 'button_count'
    }).css({
      border: 'none',
      overflow: 'hidden',
      width: '250px',
      height: '24px',
      allowTransparency: true
    });
    $('div.share').append(gplusDiv).append(twitterIframe).append(fbIframe);
  }
});
