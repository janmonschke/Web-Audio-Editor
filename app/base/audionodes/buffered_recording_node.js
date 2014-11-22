app.factory('BufferedRecordingNode', ['BufferedNode', 'BufferLoader', '$q', 'SharedAudioContext', 'Arrangement',
    function(BufferedNode, BufferLoader, $q, SharedAudioContext, Arrangement){

  return BufferedNode.extend({
    constructor: function(data, buffer){
      this.data = data;
      this.buffer = buffer;
      this.source = undefined;
      this.bufferOffsetStart = 0;
      this.context = SharedAudioContext.getContext();
      this.master = this.context.destination;
    },

    /**
     * Triggers the buffer to load
     * @return {Deferred}
     */
    fetch: function(){
      var setupDeferred = $q.defer();

      setupDeferred.resolve(this.buffer);

      return setupDeferred.promise;
    }

  });
}]);