var q = require('q');

var connection = require('../database_connection')();
var db = connection.database('audio-editor-data');

module.exports = {

  create: function(title, owner_id, cb){
    var data = {
      title: title,
      owner_id: owner_id,
      shared_with: [],
      type: 'arrangement',
      gain: 1,
      buffers: [],
      tracks: []
    };

    // save the date of creation
    data.created_at = Date.now();

    db.save(data, function(err, res){
      if(err)
        return cb(err)

      data._rev = res.rev
      data._id = res.id

      cb(null, data);
    });
  },

  // gets the arrangement from the ID and returns a promise
  // important: this method is used by the synchronization module
  // concurrent clients should not be allowed to create two concurrent get requests because they
  // might override the old model
  // therefore, this method uses a request queue
  get: function(id){
    if(this._getDeferreds[id])
      return this._getDeferreds[id].promise;
    else{
      var deferred = q.defer();
      this._getDeferreds[id] = deferred;

      // get the arrangement and resolve the promise
      db.get(String(id), function(err, arrangement){
        if(err){
          console.log('err', 'arrangement#get', id, err);
        }
        delete this._getDeferreds[id];

        deferred.resolve(arrangement);
      }.bind(this));

      return deferred.promise;
    }
  },

  // list of the deferreds
  _getDeferreds: {},

  save: function(data, cb){
    if(!cb) cb = function(err, res){ /*console.log('saved', data._id,'res ->', res, 'error? -> ', err); */};

    // save will override all newer versions!!
    this.get(data._id).then(function(model){
      db.save(data._id, model._rev, data, function(err, res){
        if(err)
          console.log('there was an error saving the arrangement', err);
        // update the _rev of the doc
        if(!err){
          data._rev = res.rev;
        }
        cb(err, res);
      });
    })
  },

  byUserId: function(userId, cb){
    db.view('arrangementByUser/byUserId', { key: userId, include_docs: true }, function(err, res){
      if(err) return cb(err, null);
      cb(err, res.map(function(arrangement){ return arrangement }));
    });
  },

  sharedWithUserId: function(userId, cb){
    db.view('arrangementByUser/sharedWithUserId', { key: userId, include_docs: true }, function(err, res){
      if(err) return cb(err, null);
      cb(err, res.map(function(arrangement){ return arrangement }));
    });
  }

};