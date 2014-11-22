app.factory('Sampler', ['$q', '$timeout', 'BaseAudioNode', 'Ticker', 'SharedAudioContext', 'BufferedNode', 'Pattern',
    function($q, $timeout, BaseAudioNode, Ticker, SharedAudioContext, BufferedNode, Pattern){

  return BaseAudioNode.extend({
    /**
     * The currently playing patter
     * @type {Pattern}
     */
    currentPattern: null,

    /**
     * The position of the current pattern
     * @type {Number}
     */
    patternOrderPosition: 0,

    lookAhead: .1,

    constructor: function(data){
      this.data = data;

      this.createPatterns();
      this.resetCurrentPattern();

      this.ticker = new Ticker();
      this.ticker.interval = 100;
      this.ticker.callback = this.ontick.bind(this);
    },

    createPatterns: function(){
      Object.keys(this.data.patterns).forEach(function(patterName){
        this[patterName] = new Pattern(this.data.patterns[patterName], this);
        this[patterName].context = this.context;
        this[patterName].master = this.master;
      }.bind(this));
    },

    resetCurrentPattern: function(){
      this.currentPatternIndex = 0;
      this.currentPattern = this[this.data.patternOrder[this.currentPatternIndex]];
    },

    nextPatternStartTime: function(){
      var nextPatternIndex = this.currentPatternIndex + 1;
      // get the time sum from all previous patterns
      var timeOffsetForNextPattern = 0;
      for(var i = 0; i < this.currentPatternIndex; i++){
        var pattern = this[this.data.patternOrder[i]];
        timeOffsetForNextPattern += pattern.length();
      }

      return (this.startedAtWithoutOffset + timeOffsetForNextPattern);
    },

    scheduleNextPattern: function(startTime){
      this.currentPattern.schedule(startTime);
      this.currentPattern.scheduled = true;
      this.currentPatternIndex++;
      this.currentPattern = this[this.data.patternOrder[this.currentPatternIndex]];
    },

    ontick: function(){
      var currentTime = this.context.currentTime;

      if(this.hasNextPattern()){
        if((currentTime + this.lookAhead) > this.nextPatternStartTime()){
          this.scheduleNextPattern(this.nextPatternStartTime());

          if(this.offsetCalculated){
            this.currentPattern.currentSlot = 0;
            this.offsetCalculated = false;
          }
        }
      }else{
        // all sounds have been scheduled, ticker can be stopped
        this.ticker.stop();
        // it's save to stop and release all sounds when the length has passed
        var timeoutTime = this.length() * 1000;
        this.stopTimeout = setTimeout(this.stop.bind(this), timeoutTime)
      }
    },

    hasNextPattern: function(){
      return (this.currentPattern && !this.currentPattern.scheduled) || 
              this.currentPatternIndex < (this.data.patternOrder.length);
    },

    length: function(){
      var length = 0;
      this.forEachPatternInOrder(function(pattern){
        length += pattern.length();
      });
      return length;
    },

    play: function(when, offset){
      this.startedAt = this.context.currentTime + when;
      this.startedAtWithoutOffset = this.startedAt - offset;
      this.offset = offset;

      if(!this.currentPattern) this.resetCurrentPattern();

      if(offset > 0){
        this.offsetCalculated = true;
        this.calculateOffset(offset);
      }

      this.ticker.start();
    },

    stop: function(){
      clearTimeout(this.stopTimeout);
      this.ticker.stop();
      this.forEachPattern(function(pattern){
        pattern.reset();
        pattern.scheduled = false;
      });
      this.resetCurrentPattern()
    },

    forEachPattern: function(cb){
      for(var patternName in this.data.patterns){
        var res = cb(this[patternName]);
        if(res === false) break;
      };
    },

    forEachPatternInOrder: function(cb){
      // iterate over pattern in patternOrder
      for(var i = 0; i < this.data.patternOrder.length; i++){
        var res = cb(this[this.data.patternOrder[i]], i);
        if(res === false) break;
      }
    },

    calculateOffset: function(offset){
      var relativeOffset = 0;
      var currentPattern = null;
      var currentPatternIndex = 0;

      // select the current pattern from the offset
      this.forEachPatternInOrder(function(pattern, index){
        relativeOffset += pattern.length();

        var length = pattern.length();
        if(offset < relativeOffset + length){
          currentPattern = pattern;
          currentPatternIndex = index;
          return false;
        }
        else{
          relativeOffset += length;
        }
      });

      this.currentPattern = currentPattern;
      this.currentPatternIndex = currentPatternIndex;

      // find out the current beat
      var beat = Math.ceil((offset - (relativeOffset - currentPattern.length())) / this.currentPattern.secondsBetweenBeats());
      this.currentPattern.currentSlot = beat - 1;
    }
  });
}]);