Qjzdclub
=

![build status][travis-image]
![Coverage Status](https://img.shields.io/coveralls/cnodejs/nodeclub.svg?style=flat-square)
![David deps][david-image]
![node version][node-image]

![Gitter](https://badges.gitter.im/Join Chat.svg)

[travis-image]: https://img.shields.io/travis/cnodejs/nodeclub.svg?style=flat-square
[david-image]: https://img.shields.io/david/cnodejs/nodeclub.svg?style=flat-square
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square

## 介绍

秦晋之巅社区源码时在Nodeclub之上改造而来的，
使用 **Node.js** 和 **MongoDB** 开发的社区系统，界面优雅，功能丰富，小巧迅速，

## 安装部署

*不保证 Windows 系统的兼容性*

```
1. install `node.js` `mongodb`
2. run mongod
3. `$ make install` 安装 Nodeclub 的依赖包
4. `$ make test` 确保各项服务都正常
5. `$ node app.js`
6. visit `localhost:3000`
7. done!
```

## 其他

跑测试

```bash
$ make test
```

跑覆盖率测试

```bash
$ make test-cov
```

## License

MIT
