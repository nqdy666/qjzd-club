/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User         = require('../proxy').User;
var Topic        = require('../proxy').Topic;
var config       = require('../config');
var eventproxy   = require('eventproxy');
var cache        = require('../common/cache');
var xmlbuilder   = require('xmlbuilder');
var renderHelper = require('../common/render_helper');
var _            = require('lodash');
var tools = require('../common/tools');

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;
  var tab = req.query.tab || 'all';

  var proxy = new eventproxy();
  proxy.fail(next);

  // 取主题
  var query = {};
  if (tab && tab !== 'all') {
    if (tab === 'good') {
      query.good = true;
    } else {
      query.tab = tab;
    }
  }

  var limit = config.list_topic_count;
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};

  Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
    return topics;
  }));

  // 取排行榜上的用户
  cache.get('tops', proxy.done(function (tops) {
    if (tops) {
      proxy.emit('tops', tops);
    } else {
      User.getUsersByQuery(
        {is_block: false},
        { limit: 10, sort: '-score'},
        proxy.done('tops', function (tops) {
          cache.set('tops', tops, 60 * 1);
          return tops;
        })
      );
    }
  }));
  // END 取排行榜上的用户

  // 取0回复的主题
  cache.get('no_reply_topics', proxy.done(function (no_reply_topics) {
    if (no_reply_topics) {
      proxy.emit('no_reply_topics', no_reply_topics);
    } else {
      Topic.getTopicsByQuery(
        { reply_count: 0, tab: {$ne: 'job'}},
        { limit: 5, sort: '-create_at'},
        proxy.done('no_reply_topics', function (no_reply_topics) {
          cache.set('no_reply_topics', no_reply_topics, 60 * 1);
          return no_reply_topics;
        }));
    }
  }));
  // END 取0回复的主题

  // 取分页数据
  var pagesCacheKey = JSON.stringify(query) + 'pages';
  cache.get(pagesCacheKey, proxy.done(function (pages) {
    if (pages) {
      proxy.emit('pages', pages);
    } else {
      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        cache.set(pagesCacheKey, pages, 60 * 1);
        proxy.emit('pages', pages);
      }));
    }
  }));
  // END 取分页数据

  var tabName = renderHelper.tabName(tab);
  proxy.all('topics', 'tops', 'no_reply_topics', 'pages',
    function (topics, tops, no_reply_topics, pages) {
      res.render('index', {
        topics: topics,
        current_page: page,
        list_topic_count: limit,
        tops: tops,
        no_reply_topics: no_reply_topics,
        pages: pages,
        tabs: config.tabs,
        tab: tab,
        pageTitle: tabName && (tabName + '版块'),
      });
    });
};

exports.forumSitemap = function (req, res, next) {
  var urlset = xmlbuilder.create('urlset', {
    version: '1.0', encoding: 'UTF-8'
  });

  var ep = new eventproxy();
  ep.fail(next);

  ep.all('forumSitmap', function(sitemap) {
    res.type('xml');
    res.send(sitemap);
  });

  cache.get('forumSitmap', ep.done(function (sitemapData) {
    if (sitemapData) {
      ep.emit('forumSitmap', sitemapData);
    } else {
      Topic.getTopicsByQuery({deleted: false}, {limit: 500, sort: '-create_at'}, function (err, topics) {
        if (err) {
          return next(err);
        }
        topics.forEach(function (topic) {
          var url = urlset.ele('url');
          url.ele('loc', 'http://' + config.host + '/topic/' + topic._id );
          url.ele('lastmod', tools.formatDate(topic.update_at, 'YYYY-MM-DD'));
          url.ele('changefreq', 'weekly');
          url.ele('priority', 0.5);
          var data = url.ele('data');
          var thread = data.ele("thread");
          thread.ele('threadUrl', 'http://' + config.host + '/topic/' + topic._id);
          thread.ele('author', topic.author.name);
          thread.ele('authorIcon', topic.author.avatar_url);
          thread.ele('threadTitle', topic.title);
          thread.ele('stickyLevel', topic.top? "3": "0");
          thread.ele('isDigest', topic.good? "1": "0");
          var post = thread.ele('post');
          post.ele('postContent', topic.content);
          post.ele('createdTime', tools.formatDate(topic.create_at, 'YYYY-MM-DDTHH:mm:ss'));
          post.end();
          thread.ele('replyCount', topic.reply_count);
          thread.ele('viewCount', topic.visit_count);
          thread.ele('lastReplyTime', tools.formatDate(topic.last_reply_at, 'YYYY-MM-DDTHH:mm:ss'));
          thread.ele('favorCount', topic.collect_count);
          thread.end();
          data.end();
          url.end();
        });

        var sitemapData = urlset.end();
        // 缓存一天
        cache.set('forumSitmap', sitemapData, 3600 * 24);
        ep.emit('forumSitmap', sitemapData);
      });
    }
  }));
};

exports.sitemap = function (req, res, next) {
  var urlset = xmlbuilder.create('urlset',
    {version: '1.0', encoding: 'UTF-8'});
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  var ep = new eventproxy();
  ep.fail(next);

  ep.all('sitemap', function (sitemap) {
    res.type('xml');
    res.send(sitemap);
  });

  cache.get('sitemap', ep.done(function (sitemapData) {
    if (sitemapData) {
      ep.emit('sitemap', sitemapData);
    } else {
      Topic.getLimit5w(function (err, topics) {
        if (err) {
          return next(err);
        }
        topics.forEach(function (topic) {
          urlset.ele('url').ele('loc', 'http://' + config.host + '/topic/' + topic._id);
        });

        var sitemapData = urlset.end();
        // 缓存一天
        cache.set('sitemap', sitemapData, 3600 * 24);
        ep.emit('sitemap', sitemapData);
      });
    }
  }));
};

exports.appDownload = function (req, res, next) {
  if (/Android/i.test(req.headers['user-agent'])) {
    res.redirect('http://fir.im/e1hc');
  } else {
    res.redirect('https://itunes.apple.com/cn/app/id954734793');
  }
};
