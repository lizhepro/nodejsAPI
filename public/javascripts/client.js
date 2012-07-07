$(document).ready(function() {
    var searchInput = $('#searchinput');
    var resultDiv = $('#result');

    var apiList;
    $.getJSON("/json/mydata.json", function(data) {
        apiList = data;
        searchInput.focus();
    });

    var autocomplete = searchInput.typeahead({
        updater: function(item) {
            var itemPath;
            var owner;
            var myKeys = Object.keys(apiList);
            for(var i=0, apiFileName; apiFileName=myKeys[i]; i++) {
                var apiFileJSON = apiList[apiFileName];
                var apiNameKeys = Object.keys(apiFileJSON);
                for(var j=0, apiName; apiName=apiNameKeys[j]; j++) {
                    if(apiName === item) {
                        itemPath = apiFileJSON[apiName];
                        owner = apiFileName;
                        break;
                    }
                }
            }

            $.getJSON('/json/' + owner, function(data) {
                var value = getValueByPath(data, itemPath);
                resultDiv.html(value.desc);
            });

            return item;
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
                var dropDownApiNames = [];
                var myKeys = Object.keys(apiList);
                for(var i=0, apiFileName; apiFileName=myKeys[i]; i++) {
                    var apiFileJSON = apiList[apiFileName];
                    var apiNameKeys = Object.keys(apiFileJSON);
                    for(var j=0, apiName; apiName=apiNameKeys[j]; j++) {
                        if(rInput.test(apiName)) {
                            dropDownApiNames.push(apiName);
                        }
                    }
                }
                self.data('active', true);

                //set your results into the typehead's source
                self.data('typeahead').source = dropDownApiNames;

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
