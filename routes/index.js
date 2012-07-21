var defaultConfig = require('../config').getDefaultConfig();
/*
* GET home page.
*/

exports.index = function(req, res){
  res.render('index', {
    title: 'Nodejs API'
  , API_VERSION: defaultConfig.API_VERSION + ''
  });
};


exports.query = function(req, res) {

};
