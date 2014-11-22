app.service('Scheduler', ['$rootScope', 'Ticker', 'Arrangement', function($rootScope, Ticker, Arrangement){

  var scheduler = {
    /**
     * Is the scheduler playing the song?
     * @type {Boolean}
     */
    playing: false,

    /**
     * When has it been started the last time
     * @type {Number}
     */
    startedAt: null,

    /**
     * When has it been stopped the last time
     * @type {Number}
     */
    stoppedAt: null,

    /**
     * From which offset should the seon be played?
     * @type {Number}
     */
    from: 0,

    /**
     * The current position in the song
     * @type {Number}
     */
    songPosition: 0,

    /**
     * Look-up table for scheduled pieces
     * @type {Object}
     */
    _scheduledPieces: {},

    start: function(from){
      this.playing = true;
      from = from || this.songPosition;
      this.startedAt = Date.now();
      this.from = from;

      this.schedule();
      this.ticker.start();
      $rootScope.$emit('player:play');
    },

    pause: function(preventEmit){
      this.playing = false;
      this.stoppedAt = Date.now();
      this.songPosition += this.lastDuration();
      this.ticker.stop();
      this.unschedulePieces();
      if(!preventEmit)
        $rootScope.$emit('player:pause');
    },

    stop: function(preventEmit){
      this.playing = false;
      this.pause(true);
      this.songPosition = 0;
      if(!preventEmit)
        $rootScope.$emit('player:stop');
    },

    setSongPosition: function(songPos){
      var continueSong = this.playing;
      console.log('songPosition', this.songPosition)
      this.stop(true);
      this.songPosition = songPos;
      $rootScope.$emit('player:position-change');
      if(continueSong)
        this.start();
    },

    lastDuration: function(){
      return (this.stoppedAt - this.startedAt) / 1000;
    },

    _delta: function(){
      return (Date.now() - this.startedAt) / 1000;
    },

    _position: function(){
      return this._delta() + this.from;
    },

    /**
     * Checks if new pieces need to be scheduled
     */
    schedule: function(){
      var position = this._position();
      var lookAhead = this.lookAhead;
      var piecePosition = 0;
      var pieceLength = 0;
      var pieceInLookahead = false;
      var pieceInBetween = false;

      // find and schedule the next pieces
      Arrangement.doc.tracks.forEach(function(track){
        // only schedule if track contains pieces
        if(!track.pieces || track.pieces.length == 0) return;

        track.pieces.forEach(function(piece){
          piecePosition = piece.position;
          // check if piece is in boundaries
          // piece shouldn't be playing already
          pieceInLookahead = position < piecePosition && position + lookAhead >= piecePosition;
          pieceInBetween = position >= piecePosition && position < piecePosition + this.lengthForPiece(piece);

          // if the current piece is in the lookAhead frame or if the current position lays in it
          // and the piece has not been scheduled yet, then go on and schedule it
          if((pieceInLookahead || pieceInBetween) && !this.hasBeenScheduled(piece)){
            // do we need to delay the start? 
            var whenToStartPiece = Math.max(piecePosition - position, 0);
            // is there an offset for the piece?
            var offset = Math.max(position - piecePosition, 0);

            this.schedulePiece(piece, whenToStartPiece, offset);
          }
        }.bind(this));
      }.bind(this));
    },

    schedulePiece: function(piece, whenToStartPiece, offset){
      var piece = Arrangement.getPiece(piece.id);
      piece.play(whenToStartPiece, offset);
      this._scheduledPieces[piece.data.id] = piece;
      console.log('schedule:piece:' + piece.data.id, whenToStartPiece, offset);
    },

    unschedulePieces: function(){
      Object.keys(this._scheduledPieces).forEach(function(key){
        if(this._scheduledPieces[key] && this._scheduledPieces[key].stop)
          this._scheduledPieces[key].stop();
      }.bind(this));
      this._scheduledPieces = {};
    },

    hasBeenScheduled: function(piece){
      return this._scheduledPieces[piece.id];
    },

    lengthForPiece: function(piece){
      var piece = Arrangement.getPiece(piece.id);
      if(piece)
        return piece.length();
      else
        return 0;
    }
  };

  // setup the ticker which will be used by the scheduler
  var ticker = new Ticker();
  ticker.callback = scheduler.schedule.bind(scheduler);
  scheduler.ticker = ticker;

  // setup the lookahead time (needs to be converted to seconds)
  scheduler.lookAhead = (3 * ticker.interval) / 1000;

  // unschedule piece by request
  $rootScope.$on('unschedule', function(event, piece){
    scheduler._scheduledPieces[piece.id] = false;
  });
  
  return scheduler;
}]);