var express   = require('express');
var config = require('./server/config/services_config');

// create the express app
var app = express();

// create the http server
var server = require('http').createServer(app);

// configure the auth module
var auth = require('./server/config/auth_config');

// configure the express app
require('./server/config/app_config')(app, auth);

// set up the routes
require('./server/routes')(app, auth);

// set up the synchronization module
require('./server/synchronization')(server);

// start the app
server.listen(config.appPort);

console.log('Server started on port:', config.appPort)