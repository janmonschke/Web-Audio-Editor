/**
 * Caches and optimizes loading of buffers
 */
app.service('BufferLoader', ['$q', '$rootScope', 'SharedAudioContext', function($q, $rootScope, SharedAudioContext){
  return {
    _cache: {},

    _deferreds: {},

    /**
     * Checks the cache and the deferred objects first before loading the bugger
     * @param  {String} bufferLocation The location of the buffer
     * @return {Deferred} a deffered object
     */
    load: function(buffer){
      var bufferLocation = buffer.location;
      // check if it's in the cache
      if(this._cache[bufferLocation]){
        var deferred = $q.defer();
        deferred.resolve(this._cache[bufferLocation]);
        return deferred.promise;
      // check if we're already loading the buffer
      }else if(this._deferreds[bufferLocation])
        return this._deferreds[bufferLocation].promise;
      // create a new deferred and load the buffer
      else
        return this._load(bufferLocation);
    },

    /**
     * Loads the buffer from the defined source and makes sure
     * that all deferreds are logged properly
     */
    _load: function(bufferLocation){
      // new deffered for this request
      var deferred = $q.defer();
      this._deferreds[bufferLocation] = deferred;

      // load the buffer
      var xhr = new XMLHttpRequest();
      xhr.open('GET', bufferLocation, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        this._decodeAudio(xhr.response, deferred, bufferLocation);
      }.bind(this);
      xhr.send();

      return deferred.promise;
    },

    /**
     * Decoded's the audio, caches the buffer and resolves the deferreds
     */
    _decodeAudio: function(arrayBuffer, deferred, bufferLocation){
      SharedAudioContext.getContext().decodeAudioData(arrayBuffer, function(buffer) {
        this._deferreds[bufferLocation] = undefined;
        this._cache[bufferLocation] = buffer;
        deferred.resolve(buffer);
        $rootScope.$emit('bufferloader:loaded', buffer);
      }.bind(this), function(e) {
        deferred.reject('Error decoding file', e);
      });
    }
  };
}]);