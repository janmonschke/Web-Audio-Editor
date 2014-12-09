var UserController = require('./controllers/user_controller');
var ArrangementController = require('./controllers/arrangement_controller');
// var WebRTCSessionController = require('./controllers/webrtc_session_controller')

module.exports = function(app, auth){
  var renderIndex = function(req, res){
    res.render('index');
  };

  var renderEditor = function(req, res){
    res.render('editor');
  };

  var renderMe = function(req, res){
    res.redirect('/me');
  };

  var renderMeIfLoggedIn = function(req, res, next){
    if(req.user)
      res.redirect('/me');
    else
      next();
  };

  app.get('/me', UserController.me);

  app.get('/login', renderMeIfLoggedIn, function(req, res){
    res.render('login');
  });

  app.post('/login', auth.authenticate('local', {
    successRedirect: '/me',
    failureRedirect: '/login',
    failureFlash: true,
    failureMessage: 'Could not log you in!'
  }), renderMe);

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/register', renderMeIfLoggedIn, function(req, res){
    res.render('register');
  });

  app.post('/register', UserController.register);

  app.get('/sign_s3', ArrangementController.signS3);
  app.delete('/delete_s3/:s3Id', ArrangementController.deleteUpload);
  app.get('/arrangement/:arrangement_id', renderEditor);
  app.post('/arrangement/:new', ArrangementController.create);
  app.delete('/arrangement/:arrangement_id/delete_upload/:file_name', ArrangementController.deleteUpload);

  // app.get('/arrangement/:arrangement_id/webrtc_session', WebRTCSessionController.show);

  app.get('/', renderIndex);
  app.get('/recording', renderIndex);
  app.get('/synth', renderIndex);

};