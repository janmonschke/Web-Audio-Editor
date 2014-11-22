app.factory('BufferedNode', ['BaseAudioNode', 'BufferLoader', '$q', 'Arrangement',
    function(BaseAudioNode, BufferLoader, $q, Arrangement){

  return BaseAudioNode.extend({
    constructor: function(data){
      this.data = data;
      this.buffer = undefined;
      this.source = undefined;
    },

    length: function(){
      if(this.buffer){
        // calculate the duration either from the bufferOffset or from the duration
        if(this.data.offsetStart || this.data.offsetEnd)
          // only play for the duration between the two offsets
          return this.buffer.duration - this.data.offsetStart - this.data.offsetEnd;
        else
          return this.buffer.duration;
      }else{
        return 0;
      }
    },

    /**
     * Triggers the buffer to load
     * @return {Deferred}
     */
    fetch: function(){
      var setupDeferred = $q.defer();
      if(this.buffer){
        setupDeferred.resolve(this.buffer);
      }else{
        var bufferObject = Arrangement.getBufferFromId(this.data.buffer_id);
        var loadDeferred = BufferLoader.load(bufferObject);
        loadDeferred.then(function(buffer){
          this.buffer = buffer;
          setupDeferred.resolve(buffer);
        }.bind(this));
      }
      return setupDeferred.promise;
    },

    /**
     * Is the current source node playing?
     * @return {Boolean} playing or not
     */
    isPlaying: function(){
      var source = this.source;
      return (source && source.playbackState == source.PLAYING_STATE);
    },

    /**
     * Play the node buffer
     * @param  {Number} when offset (in seconds) of when to start playing, defaults to 0
     */
    play: function(when, offset, forcedTime){
      if(!when){ when = 0; } // start immediately if not defined
      if(!offset){ offset = 0; } // no offset by default

      var master = this.master;
      var context = this.context;
      var source = context.createBufferSource();
      var gain = context.createGain();
      source.buffer = this.buffer;
      source.connect(gain)
      gain.connect(master);
      gain.gain.value = _.isNumber(this.data.gain) ? this.data.gain : 1;

      var duration = this.length();

      when = (forcedTime != undefined) ? forcedTime : (context.currentTime + when);

      // start at defined point, with defined offset, for calculated duration
      source.start(when, offset + (this.data.offsetStart || 0), duration);
      this.source = source;
      return source;
    },

    stop: function(){
      try{
        // stop node even if it is not playing (it might be scheduled)
        this.source.stop(0);
      }catch(e){
        console.log('problem while stopping a buffered node', e);
      }
    }

  });
}]);