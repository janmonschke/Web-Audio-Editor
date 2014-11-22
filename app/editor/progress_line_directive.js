app.directive('progressLine', ['$rootScope', 'Scheduler', 'EditorConfig', 'Arrangement',
    function($rootScope, Scheduler, EditorConfig, Arrangement) {

  var setToCurrentPosition = function(el){
    var startPosition = Scheduler.songPosition * EditorConfig.pixelsPerSecond + EditorConfig.track_settings_offset;
    el.removeClass('animated').css('transitionDuration', '0s');
    _.defer(function(){
      el.css('left', startPosition + 'px');
    });
  };

  var startAnimating = function(el){
    var endPosition = 0;
    
    // select the end position from the most right piece in the DOM
    var pieces = document.querySelectorAll('.piece');
    for(var i = 0; i < pieces.length; i++){
      var pieceElement = pieces[i];
      var rect = pieceElement.getBoundingClientRect();
      var $currentRight = rect.left + rect.width;
      endPosition = $currentRight > endPosition ? $currentRight : endPosition;
    };

    var duration = Arrangement.length() - Scheduler.songPosition;

    setToCurrentPosition(el);
    _.defer(function(){
      el.addClass('animated').removeClass('notAnimated').css({
        transitionDuration: duration + 's',
        left: endPosition + 'px'
      }).one('transitionend', function(){
        el.removeClass('animated').addClass('notAnimated');
      });
    });
  };

  var stopAnimating = function(el){
    setToCurrentPosition(el);
  };

  return {
    restrict: 'E',
    template: '<div id="progress-line"></div>',
    link: function(scope, element, attr){
      var progressLine = angular.element(document.getElementById('progress-line'));
      setToCurrentPosition(progressLine);

      $rootScope.$on('player:play', function(){ startAnimating(progressLine); });
      $rootScope.$on('player:pause', function(){ stopAnimating(progressLine); });
      $rootScope.$on('player:stop', function(){ stopAnimating(progressLine); });
      $rootScope.$on('player:position-change', function(){ stopAnimating(progressLine); });

      scope.$watch('config.pixelsPerSecond', function(){ setToCurrentPosition(progressLine); });
    }
  }
}]);