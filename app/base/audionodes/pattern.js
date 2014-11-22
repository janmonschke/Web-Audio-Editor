app.factory('Pattern', ['BufferedRecordingNode', '$q', 'BufferedNode', 'Ticker', 'Drumkits', 'SharedAudioContext',
    function(BufferedRecordingNode, $q, BufferedNode, Ticker, Drumkits, SharedAudioContext){

  return Class.extend({
    constructor: function(data, sampler){
      this.data = data;
      this.sampler = sampler;
      this.scheduledSounds = [];
      this.reset();
    },

    reset: function(){
      this.currentSlot = -1;
      this.nextBeatScheduledFor = 0;
      this.scheduledSounds.forEach(function(sound){
        sound.stop();
      });
      this.scheduledSounds = [];
    },

    hasMoreBeats: function(){
      return this.currentSlot < (this.data.slots - 1);
    },

    length: function(){
      return this.data.slots * this.secondsBetweenBeats();
    },

    secondsBetweenBeats: function(){
      return (60 / this.data.bpm) / 4;
    },

    schedule: function(startTime){
      var instruments = Drumkits.instrumentsForKit(this.sampler.data.drumType);
      var secondsBetweenBeats = this.secondsBetweenBeats();
      for(var instrumentIndex = 0; instrumentIndex < instruments.length; instrumentIndex++){
        var instrument = instruments[instrumentIndex];
        if(this.data.beats[instrument]){
          var instrStartTime = startTime;
          for(var beatIndex = 0; beatIndex < this.data.slots; beatIndex++){
            instrStartTime += secondsBetweenBeats;
            if(this.data.beats[instrument][beatIndex]){
              if(beatIndex >= this.currentSlot){
                this.scheduledSounds.push(
                  Drumkits.play(this.sampler.data.drumType, instrument, this.sampler.master, null, null, instrStartTime)
                );
              }
            }
          }
        }
      }
    },

    // loop the pattern
    loop: function(notify){
      this.ticker = new Ticker();
      this.ticker.interval = 30;
      var context = SharedAudioContext.getContext();
      var nextBeatTime = context.currentTime;
      var beat = -1;
      var lookAhead = .1;

      this.ticker.callback = function(){
        if(nextBeatTime <= context.currentTime + lookAhead){
          // set to the next beat, and sanitize it
          beat = beat + 1;
          if(beat >= this.data.slots) beat = 0;

          nextBeatTime += this.secondsBetweenBeats();

          Drumkits.instrumentsForKit(this.sampler.data.drumType).forEach(function(instrument){
            if(this.data.beats[instrument][beat]){
              Drumkits.play(this.sampler.data.drumType, instrument, this.sampler.master, null, null, nextBeatTime - lookAhead)
            }
          }.bind(this));

          notify(beat);
        }
      }.bind(this);
      this.ticker.start();
    },

    stopLoop: function(){
      if(this.ticker)
        this.ticker.stop();
    }
  })
}]);