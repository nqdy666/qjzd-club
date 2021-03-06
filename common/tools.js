var bcrypt = require('bcryptjs');
var moment = require('moment');

moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
  date = moment(date);

  if (typeof (friendly) !== 'string') {
    if (friendly) {
      return date.fromNow();
    } else {
      return date.format('YYYY-MM-DD HH:mm');
    }
  }
  var formateStr = friendly;
  return date.format(formateStr);
};

exports.validateId = function (str) {
  return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};

exports.bhash = function (str, callback) {
  bcrypt.hash(str, 10, callback);
};

exports.bcompare = function (str, hash, callback) {
  bcrypt.compare(str, hash, callback);
};

//获取某个区间的随机数字
exports.random = function(min, max) {
  return Math.floor(min + Math.random() * (max - min));
};

