var config = require('../config');

exports.index = function (req, res, next) {
  var q = req.query.q;
  q = encodeURIComponent(q);
  res.redirect('https://www.bing.com/search?q=site:' + config.host + " " + q);
};
