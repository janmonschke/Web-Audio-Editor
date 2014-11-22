module.exports = {
  fail: function(err){
    console.log('there was an error!');
    console.log(err);
  },

  noErrorOrFilexists: function(err){
    return (!err || (err.error && err.error == 'file_exists'));
  }
}