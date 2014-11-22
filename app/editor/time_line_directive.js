app.directive('timeLine', ['$rootScope', 'Arrangement', 'EditorConfig', 'Scheduler',
    function($rootScope, Arrangement, EditorConfig, Scheduler) {

  var fillColor = '#888';
  var height = 15;

  var render = function(canvas){
    var context = canvas[0].getContext('2d');
    var length = Arrangement.length();
    var pixelsPerSecond = EditorConfig.pixelsPerSecond;

    var width = pixelsPerSecond * length;
    canvas.prop('width', width);
    canvas.prop('height', height);

    context.clearRect(0,0,width,canvas.prop('height'));

    context.fillStyle = fillColor;

    for(var seconds = 0; seconds <= length; seconds++){
      context.fillRect(seconds * pixelsPerSecond, 0, 1, height);
      context.fillRect((seconds + .5) * pixelsPerSecond, 0, 1, height / 2);
    }
  };

  // make sure render is not called too often
  var render = _.debounce(render, 1000);

  var setSongPosition = function(event, element){
    // get the new song position from the click
    var rect = element[0].getBoundingClientRect();
    var newSongPosition = (event.x - rect.left) / EditorConfig.pixelsPerSecond;
    Scheduler.setSongPosition(newSongPosition);
  };

  return {
    restrict: 'E',
    template: '<div class="time-line"><canvas height="'+ height +'"></canvas></div>',
    link: function(scope, element, attr){
      var canvas = element.find('canvas');

      render(canvas);

      scope.$watch('config.pixelsPerSecond', function(newv, oldv){
        if(newv != oldv) render(canvas);
      });
      $rootScope.$on('bufferloader:loaded', function(){ render(canvas); });

      element.on('click', function(event){
        setSongPosition(event, canvas);
      });
    }
  }
}]);