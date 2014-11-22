var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

var checkPassword = function(user, pw, cb){
  bcrypt.compare(pw, user.pwhash, cb);
};

var authenticate = function(username, pw, done){
  User.findByName(username, function(err, user){
    // if there has been an error or the user could not be found, return the error
    if(err || !user){
      return done(err, null);
    }else{
      // check the password if there was no error
      checkPassword(user, pw, function(err, passwordCorrect){
        // return an error when the password is not correct
        if(err || !passwordCorrect)
          return done(null, null, err);
        else
          // if all went ell, the user is can be authenticated
          done(null, user);
      })
    }
  });
};

var serializeUser = function(user, done){
  if(user.id)
    done(null, user.id);
  else
    done(null, user._id);
};

var deserializeUser = function(id, done){
  User.get(id, function(err, user){
    if(err || !user)
      return done(null, null, null);
    done(null, user);
  });
};

// make passport use the above defined methods
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

// use the standard password procedure
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, authenticate));

module.exports = passport;