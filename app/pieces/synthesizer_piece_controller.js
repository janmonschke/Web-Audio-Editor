app.controller('SynthesizerPieceController', ['$rootScope', '$scope', 'utils', 'Arrangement', 'Synthesizer', 'IDGenerator', 'EditorConfig',
  function($rootScope, $scope, utils, Arrangement, Synthesizer, IDGenerator, EditorConfig){

    $scope.node = new Synthesizer($scope.piece);
    $scope.node.master = $scope.trackNode.in;
    $scope.node.context = $scope.trackNode.context;
    $scope.synthSettings = $scope.node.data.synthSettings;

    $scope.node.setup();

    Arrangement.registerPiece($scope.node.data.id, $scope.node);

    $scope.edit = function(){
      $scope.addAdditionalContent('<div synthesizer-piece-edit class="synthesizer-piece-edit-container"></div>', $scope);
    };

    $scope.remove = function(){
      Arrangement.removePieceFromTrack($scope.piece, $scope.track);
      disconnectNodes();
    };

    var unwatchChange = $scope.$watch('piece.position', function(a,b){
      if(a != b)
        $scope.node.stop();
    });

    var resetValues = function(){
      $scope.node.setupSettings();
      $scope.node.wireUpNodes();
    };

    var disconnectNodes = function(){
      $scope.node.compressor.disconnect();
      $scope.node.compressor = null;
      $scope.node.filter.disconnect();
      $scope.node.filter = null;
      $scope.node.lfo.disconnect();
      $scope.node.lfo.stop(0);
      $scope.node.lfo = null;
      $scope.node.osc1Gain.disconnect();
      $scope.node.osc1Gain.null;
      $scope.node.osc2Gain.disconnect();
      $scope.node.osc2Gain.null;
      $scope.node.osc3Gain.disconnect();
      $scope.node.osc3Gain.null;
      $scope.node.stop();
    };

    $scope.addTone = function(note, event){
      event.stopPropagation();
      event.preventDefault();

      var toneId = IDGenerator.generate('tone');
      var newTone = {
        id: toneId,
        duration: 1,
        note: note,
        position: (event.x - 256) / EditorConfig.pixelsPerSecond
      };
      $scope.piece.tones.push(newTone);
    };

    $scope.removeTone = function(tone, event){
      event.stopPropagation();
      event.preventDefault();

      var index = $scope.piece.tones.indexOf(tone);
      if(index > -1)
        $scope.piece.tones.splice(index, 1);
    };

    var unwatchLfo = $scope.$watch('piece.synthSettings', function(oldV, newV){ if(oldV != newV) resetValues() }, true)

}]);