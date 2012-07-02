$(document).ready(function() {
  var indexList = null;
  var searchInput = $('#searchinput');
  var resultDiv = $('#result');
  var autocomplete = searchInput.typeahead({
    updater: function(item) {
      var itemWithOutType = item.replace(/\[\w+\]/, '');

      for(var key in indexList) {
        var value = indexList[key];
        if(value.textRaw == itemWithOutType) {
          var outputHtml = '';
          value.desc ? outputHtml += value.desc : null;

          resultDiv.html(outputHtml);
        }
      }
      return itemWithOutType;

    }
  })
  .on('keyup', function(ev){

    /* 			console.log(ev); */
    ev.stopPropagation();
    ev.preventDefault();

    //filter out up/down, tab, enter, and escape keys
    if( $.inArray(ev.keyCode,[40,38,9,13,27]) === -1 ){

      var self = $(this);

      //set typeahead source to empty
      self.data('typeahead').source = [];

      //active used so we aren't triggering duplicate keyup events
      if( !self.data('active') && self.val().length > 0){

        self.data('active', true);

        //Do data request. Insert your own API logic here.
        /*                     console.log($(this).val()); */

        //Do data request. Insert your own API logic here.

        $.getJSON("/query", {
          q: self.val()
        }, function(data) {
          indexList = data;

          /*                     	console.log(data.results.length); */

          //set this to true when your callback executes
          self.data('active',true);

          //Filter out your own parameters. Populate them into an array, since this is what typeahead's source requires
          var arr = [];
          var i = 0;
          for(var key in data) {
            var value = data[key];
            var typeString = '';
            if(value.type) {
              typeString = '[' + value.type + ']';
            }
            arr[i++] = typeString + value.textRaw
            console.log(value.textRaw);
          }

          //set your results into the typehead's source
          self.data('typeahead').source = arr;

          //trigger keyup on the typeahead to make it search
          self.trigger('keyup');

          //All done, set to false to prepare for the next remote query.
          self.data('active', false);

        });

      }
    }
  });
});
