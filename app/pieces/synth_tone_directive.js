app.directive('synthTone', ['$compile', 'EditorConfig',
    function($compile, EditorConfig) {

  var setWidth = function(element, duration){
    element.css('width', (EditorConfig.pixelsPerSecond * duration) + 'px');
  };

  return {
    restrict: 'A',
    templateUrl: 'pieces/synth_tone.html',
    link: function(scope, element, attrs){

      var widthHandle = angular.element(element[0].querySelector('.width-handle'));
      var updateWidth = function(){
        setWidth(element, scope.tone.duration);
      };

      widthHandle.on('drag', function(event, xDiff){
        scope.tone.duration += xDiff / EditorConfig.pixelsPerSecond;
        updateWidth();
      });

      scope.$watch('tone.duration', updateWidth);

      element.on('$destroy', function(){
        console.log('destory all watchers')
      });
    }
  }
}]);