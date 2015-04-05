var app = require('../../app');
var request = require('supertest')(app);

describe('test/controllers/search.test.js', function () {
  it('should redirect to google search', function (done) {
    request.get('/search').query({q: 'node 中文'})
      .expect(302)
      .end(function (err, res) {
        done(err);
      });
  });
});
