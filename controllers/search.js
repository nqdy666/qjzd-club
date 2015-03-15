var config = require('../config');

exports.index = function (req, res, next) {
  var q = req.query.q;
  q = encodeURIComponent(q);
  res.redirect('https://www.baidu.com/s?word=site:' + config.host + " " + q);
};
