const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'myblog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/myblog-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'myblog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/myblog-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'myblog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/myblog-production'
  }
};

module.exports = config[env];
