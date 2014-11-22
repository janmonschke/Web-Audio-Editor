app.controller('DrumPieceEditController', ['$rootScope', '$scope', 'BufferedNode', 'Arrangement', 'Drumkits', 'SharedAudioContext',
  function($rootScope, $scope, BufferedNode, Arrangement, Drumkits, SharedAudioContext){
    $scope.avalaibleDrumkits = Object.keys(Drumkits.kits);

    $scope.currentPatternName = 'a';
    $scope.isCurrentPattern = function(patternName){
      return $scope.currentPatternName == patternName;
    };

    $scope.showPart = function(patternName){
      if(machinePlaying)
        $scope.startStopPlayback();
      $scope.currentPatternName = patternName;
    };

    var machinePlaying = false;
    $scope.startStopPlayback = function(){
      if(machinePlaying){
        $scope.node[$scope.currentPatternName].stopLoop();
        $scope.loopBeat = -1;
      }else{
        $rootScope.$emit('force-stop');
        $scope.node[$scope.currentPatternName].loop(function(beat){
          $scope.$apply(function(){
            $scope.loopBeat = beat;
          });
        });
      }
      machinePlaying = !machinePlaying;
    };

    $scope.playState = function(){
      return (machinePlaying ? 'icon-pause' : 'icon-play');
    };

    $scope.removeFromPatternOrder = function(index){
      $scope.piece.patternOrder.splice(index, 1);
    };

    $scope.movePatternRight = function(index){
      if(index > 0){
        var swap = $scope.piece.patternOrder[index-1];
        $scope.piece.patternOrder[index-1] = $scope.piece.patternOrder[index];
        $scope.piece.patternOrder[index] = swap;
      }
    };

    $scope.movePatternLeft = function(index){
      if(index < $scope.piece.patternOrder.length - 1){
        var swap = $scope.piece.patternOrder[index+1];
        $scope.piece.patternOrder[index+1] = $scope.piece.patternOrder[index];
        $scope.piece.patternOrder[index] = swap
      }
    };

    $scope.changeSlots = function(){
      // change the slot length
      var currentPattern = $scope.node[$scope.currentPatternName].data;
      var slots = currentPattern.slots;

      Drumkits.instrumentsForKit($scope.piece.drumType).forEach(function(instrument){
        var currentBeats = currentPattern.beats[instrument];
        // fill with an empty array
        if(!currentBeats)
          currentPattern.beats[instrument] = new Array(slots);
        else{
          // if the current length is bigger, shrink the array
          if(currentBeats.length > slots){
            currentPattern.beats[instrument] = currentBeats.slice(0, slots);
          }else if(slots > currentBeats.length){
            // the new slots number is higher, add more zeros
            var slotDiff = slots - currentBeats.length;
            for(var i = 0; i < slotDiff; i++)
              currentPattern.beats[instrument].push(0);
          }
        }
      });
    };

    // add empty arrays where needed
    var unwatchCurrentPattern = $scope.$watch('currentPatternName', function(){
      var currentPattern = $scope.node[$scope.currentPatternName].data;
      Drumkits.instrumentsForKit($scope.piece.drumType).forEach(function(instrument){
        if(!_.isArray(currentPattern.beats[instrument]))
          currentPattern.beats[instrument] = new Array(currentPattern.slots);
      });
    });

    var unwatchPlay = $rootScope.$on('player:play', function(){
      if(machinePlaying){
        $scope.startStopPlayback();
      }
    });

    $scope.tearDown = function(){
      unwatchPlay();
      // stop the playback
      machinePlaying = true;
      $scope.startStopPlayback();
    };

}]);