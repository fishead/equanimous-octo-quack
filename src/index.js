'use strict';

const app = require('express')();
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const debug = require('debug')('eztv:index');


module.exports = function (config) {
  app.enable('trust proxy');
  app.use(logger('dev'));

  app.use(cors());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use('/shows', require('./routes/show')(config));

  app.use((req, res) => {
    res.status(404).end();
  });

  app.use((err, req, res) => {
    debug(err);
    res.status(500).json({
      error: 'unknown',
      message: '未知错误'
    });
  });

  return app;
};
