'use strict';

const debug = console.log.bind(console); // eslint-disable-line


const startServer = function startServer(config) {
  const app = require('../src/')(config);
  const port = config.listen_port;
  app.listen(port, () => {
    debug('server listening on ' + port);
  });
};

(function () {
  const config = require('../config');
  startServer(config);
}());
