var UserModel = require('../../models').User;

describe('test/models/user.test.js', function () {
  it('should return proxy avatar url', function () {
    var user = new UserModel({email: 'alsotang@gmail.com'});
  });
});
