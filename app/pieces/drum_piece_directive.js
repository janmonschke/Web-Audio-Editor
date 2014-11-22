app.directive('drumPiece', ['$rootScope', 'EditorConfig', 'Drumkits',
    function($rootScope, EditorConfig, Drumkits) {

  var renderBeats = function(scope, element){
    var canvasContext = element[0].getContext('2d');
    var length = scope.node.length();
    var width = length * EditorConfig.pixelsPerSecond;
    var height = parseInt(element.prop('height'));
    var instruments = Drumkits.instrumentsForKit(scope.piece.drumType);

    element.prop('width', width);

    canvasContext.clearRect(0, 0, width, height);
    canvasContext.fillStyle = '#bada55';

    // sum up all beats
    var beatSum = 0;
    scope.piece.patternOrder.forEach(function(patternName){
      beatSum += scope.piece.patterns[patternName].slots;
    });

    // calculate the necessary width and height for single beats
    var heightPerBeat = height / instruments.length;

    // render each beat
    var xOffset = 0;
    scope.piece.patternOrder.forEach(function(patternName){
      var pattern = scope.piece.patterns[patternName];
      var patternObject = scope.node[patternName];
      var widthPerBeat = patternObject.secondsBetweenBeats() * EditorConfig.pixelsPerSecond;

      instruments.forEach(function(instrument, instrumentIndex){
        // some beats may not exist, so return
        if(!pattern.beats[instrument]) return;

        // render beat if not zero
        pattern.beats[instrument].forEach(function(beat, beatIndex){
          if(beat)
            canvasContext.fillRect(
              xOffset + beatIndex * widthPerBeat,
              instrumentIndex * heightPerBeat,
              widthPerBeat,
              heightPerBeat
            )
        });
      });

      // increase the xOffset by the current width
      xOffset += pattern.slots * widthPerBeat;
    });
  };

  return {
    restrict: 'E',
    templateUrl: 'pieces/drum_piece.html',
    controller: 'DrumPieceController',
    link: function(scope, element, attrs){
      // get the canvas element and render the beats
      var canvasElement = angular.element(element[0].querySelector('canvas'));

      renderBeats(scope, canvasElement);

      var unwatchPixels = scope.$watch('config.pixelsPerSecond', function(oldv, newv){
        if(oldv != newv)
          renderBeats(scope, canvasElement);
      });

      var unwatchChanges = scope.$watch('piece', function(oldv, newv){
        if(oldv != newv)
          renderBeats(scope, canvasElement);
      }, true)

      element.on('$destroy', function(){
        unwatchPixels();
        unwatchChanges();
      });
    }
  }
}]);