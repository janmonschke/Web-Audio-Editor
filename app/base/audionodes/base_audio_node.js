app.factory('BaseAudioNode', [function(){
  return Class.extend({
    constructor: function(data) {
      this.gain = 1;
      this.data = data;
    },

    /**
     * Returns the length of this node. Each node type may need a specific implementation here.
     * @return {Number} The length in seconds
     */
    length: function(){
      return 0;
    }
  });
}])