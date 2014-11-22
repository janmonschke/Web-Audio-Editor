var User = require('../models/user');
var Arrangement = require('../models/arrangement');

module.exports = {
  register: function(req, res){

    var data = {
      username: req.body.username,
      email: req.body.email
    };

    var password = req.body.password;

    User.createWithPassword(data, password, function(err, user){
      // something went wrong
      if(err || !user)
        res.redirect('/register');
      else
        // user successfully created, log it in and redirect
        req.login(user, function(err){
          if(err)
            return res.redirect('/register');
          res.redirect('/me');
        })
    });
  },

  me: function(req, res){
    if(!req.user){
      return res.redirect('/login');
    }

    Arrangement.byUserId(req.user._id, function(err, arrangements){
      Arrangement.sharedWithUserId(req.user._id, function(err, sharedArrangements){
        res.render('me', {
          sharedArrangements: sharedArrangements,
          arrangements: arrangements
        });
      })
    });
  }
};