app.service('Drumkits', ['BufferLoader', 'SharedAudioContext', '$rootScope', function(BufferLoader, SharedAudioContext, $rootScope){

  var buffers = {};
  var sources = [];
  var context = SharedAudioContext.getContext();

  var cleanupSourceNodes = function(){
    sources.forEach(function(source){
      try{
        source.disconnect();
        source.stop();
      }catch(e){
        console.log(e);
      }
    });
    sources = [];
  };

  $rootScope.$on('stop', cleanupSourceNodes);
  $rootScope.$on('force-stop', cleanupSourceNodes);

  return {
    loadKit: function(kitName){
      return BufferLoader.load(this.kits[kitName]).then(function(buffer){
        buffers[kitName] = buffer;
      });
    },

    getKit: function(kitName){
      return buffers[kitName];
    },

    noop: function(){
      return { stop: function(){} };
    },

    play: function(kitName, instrument, master, when, offset, forcedTime){
      if(!when){ when = 0; } // start immediately if not defined
      if(!offset){ offset = 0; } // no offset by default

      var source = context.createBufferSource();
      var kit = this.getKit(kitName);
      if(!kit) return this.noop();

      source.buffer = kit;
      source.connect(master);

      var offsets = this.kits[kitName].instruments[instrument];
      if(!offsets) return this.noop();
      var duration = offsets[1] - offsets[0];

      when = (forcedTime != undefined) ? forcedTime : (context.currentTime + when);

      // start at defined point, with defined offset, for calculated duration
      source.start(when, offsets[0], duration);

      // add source node to reference dump
      sources.push(source)

      return source;
    },

    instrumentsForKit: function(kitName){
      return Object.keys(this.kits[kitName].instruments);
    },

    kits: {
      regular: {
        location: '/sounds/drumkits/regular.wav',
        instruments: {
          bass: [0, 0.522],
          kick: [0.546, 1.173],
          snare: [1.194, 1.540],
          "hihat-open": [1.555, 2.443],
          "hihat-closed": [2.475, 2.594]
        }
      },
      trap: {
        location: '/sounds/drumkits/trap.wav',
        instruments: {
          bass: [0, 0.626],
          kick: [0.641, 1.006],
          snare: [1.020, 1.365],
          "hihat-closed": [1.380, 1.535]
        }
      }
    }
  }
}]);