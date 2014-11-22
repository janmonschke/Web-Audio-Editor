app.factory('Ticker', ['$rootScope', function($rootScope){
  var Ticker = function(){
    this.interval = 100;
    this.running = false;
    this.callback = function(){};
  };

  /**
   * Is the Ticker running?
   * @return {Boolean}
   */
  Ticker.prototype.isRunning = function(){ return this.running === true; };

  /**
   * Start the ticking!
   */
  Ticker.prototype.start = function(){
    if(this.isRunning()) return;

    var tick = function(){ this.callback(); }.bind(this);
    this.intervalHandle = setInterval(tick, this.interval);
    this.running = true;
    tick();
  };

  /**
   * Stop the ticking
   */
  Ticker.prototype.stop = function(){
    if(!this.isRunning()) return;

    clearInterval(this.intervalHandle);

    this.intervalHandle = undefined;
    this.running = false;
  };

  return Ticker;
}]);