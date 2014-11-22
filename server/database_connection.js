var cradle = require('cradle');
var config = require('./config/services_config');

var setup = {
  raw: false,
  cache: false,
  host: config.db.host,
  protocol: config.db.protocol,
  port: config.db.port,
  auth: {
    username: config.db.admin,
    password: config.db.password
  }
};

cradle.setup(setup);

module.exports = function(){
  return new(cradle.Connection)();
};