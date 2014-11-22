// Configure the app
var express = require('express');
var config = require('./services_config');
var RedisStore = require('connect-redis')(express);
var path = require('path');

module.exports = function(app, auth){

  app.configure(function(){
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/../views');

    // static project files
    app.use(express.static(__dirname + '/../../public'));

    // server uploaded files
    var uploadedPath = path.join(__dirname, '..', 'uploads');
    app.use('/uploads', express.static(uploadedPath));

    // various express helpers
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

    // set up the session store
    app.use(express.session({
      store: new RedisStore({
        port: config.redis.port,
        host: config.redis.host,
        pass: config.redis.pass
      }),
      secret: config.sessionSecret,
      cookie: {
        maxAge: 604800000
      }
    }));

    // initialize auth
    app.use(auth.initialize());
    app.use(auth.session());

    // make the user available
    app.use(function(req, res, next) {
      res.locals.user = req.user;
      next();
    });

    // initialize the router
    app.use(app.router);
  });

};