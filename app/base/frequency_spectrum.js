app.directive('frequencySpectrum', ['$rootScope', '$compile',
  function($rootScope, $compile) {

  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      var context = element[0].getContext('2d');
      var width = element[0].width;
      var height = element[0].height;
      var max = 128;

      var draw = function(){
        if(!scope.analyser) return;

        var waveData = new Uint8Array(scope.analyser.frequencyBinCount);
        var stepSize = Math.ceil(scope.analyser.frequencyBinCount / width);

        scope.analyser.smoothingTimeConstant = .7;
        scope.analyser.getByteFrequencyData(waveData);

        context.clearRect(0, 0, width, height);

        for(var i = 0; i < width; i++){
          var value = 0;
          var sum = 0;
          for(var j = 0; j < stepSize; j++){
            sum += waveData[i * stepSize + j];
          }
          value = sum / stepSize;
          var barHeight = (value / max) * (height / 2);
          context.fillRect(i, height - barHeight, 1, height - (height - barHeight));
        }

        if(scope.analyser)
          requestAnimationFrame(draw);
      };

      draw();

      // draw when there is an analyser
      scope.$watch('analyser', draw);
    }
  }
}]);