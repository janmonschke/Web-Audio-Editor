app.controller('EditorTrackController', ['$rootScope', '$scope', 'Track', 'Arrangement', 'IDGenerator',
  function($rootScope, $scope, Track, Arrangement, IDGenerator){
    $scope.trackNode = new Track($scope.track);
    $scope.muted = false;
    $scope.solo = false;

    // update the gain in the audio node when it changes
    $scope.$watch('track.gain', function(newValue, oldValue){
      $scope.trackNode.in.gain.value = parseFloat(newValue, 10);
    });

    // mute track when another track has been soloed
    $rootScope.$on('soloed-track', function(event, sendingScope){
      // if I sent the broadcast, don't handle it
      if(sendingScope == $scope) return;
      $scope.solo = false;
      $scope.trackNode.in.gain.value = 0;
    });

    // unmute track
    $rootScope.$on('un-soloed-track', function(){
      // dont unmute if muting was set specifically
      if($scope.muted) return;
      $scope.trackNode.in.gain.value = $scope.track.gain;
    });

    $scope.toggleMute = function(){
      if($scope.muted)
        $scope.unMuteTrack();
      else
        $scope.muteTrack();
    };

    $scope.unMuteTrack = function(){
      $scope.muted = false;
      $scope.trackNode.in.gain.value = $scope.track.gain;
    };

    $scope.muteTrack = function(){
      $scope.muted = true;
      $scope.solo = false;
      $scope.trackNode.in.gain.value = 0;
    };

    $scope.toggleSolo = function(){
      if($scope.solo)
        $scope.unSoloTrack()
      else
        $scope.soloTrack()
    };

    $scope.soloTrack = function(){
      $scope.solo = true;
      $scope.unMuteTrack();
      $rootScope.$broadcast('soloed-track', $scope);
    };

    $scope.unSoloTrack = function(){
      $scope.solo = false;
      $rootScope.$broadcast('un-soloed-track', $scope);
    };

    $scope.uploadFile = function(file, position){
      Arrangement.uploadBufferAndAddToTrack(file, $scope.track.id, position);
    };

    $scope.addBuffer = function(bufferId, position){
      Arrangement.addBufferToTrack(bufferId, $scope.track.id, position);
    };

    $scope.addPiece = function(event){
      switch($scope.track.type){
        case 'synthesizer':
          $scope.track.pieces.push({
            "type": "synthesizer",
            "position": 0,
            "id": IDGenerator.generate('synthesizer'),
            "tones": [],
            "synthSettings": {
              "osc1": {
                "type": "square",
                "gain": 1,
                "detune": 0
              },
              "osc2": {
                "type": "sine",
                "gain": 1,
                "detune": 0
              },
              "osc3": {
                "type": "triangle",
                "gain": .5,
                "detune": 0
              },
              "lfo":{
                "type": "sine",
                "frequency": 0
              },
              "toneEnvelope": {
                "attack": 0,
                "decay": 0,
                "sustain": 1,
                "release": 0,
                "boost": 0
              },
              "filter": {
                "frequency": 0,
                "Q": 0,
                "gain": 1,
                "detune": 0,
                "type": "lowpass",
                "activate": false
              }
            }
          });
          break;
        case 'drums':
          $scope.track.pieces.push({
            "type": "drum",
            "drumType": "trap",
            "position": 0,
            "id": IDGenerator.generate('drums'),
            "instruments": ["hihat-closed","bass","snare"],
            "patternOrder": ['a'],
            "patterns": {
              a: { 'slots': 16, 'bpm': 100,'beats': {} },
              b: { 'slots': 16, 'bpm': 100,'beats': {} },
              c: { 'slots': 16, 'bpm': 100,'beats': {} },
              d: { 'slots': 16, 'bpm': 100,'beats': {} },
              e: { 'slots': 16, 'bpm': 100,'beats': {} },
              f: { 'slots': 16, 'bpm': 100,'beats': {} }
            }
          })
          break;
        case 'recording':
          $scope.addAdditionalContent('<div recording-element ng-model="track"></div>', $scope);
          break;
      }
    };

    $scope.addRecordingElement = function(){
      $scope.addAdditionalContent('<div recording-element ng-model="track"></div>', $scope);
    };

    $scope.removeTrack = function(){
      if(confirm("Do you really want to remove this track? (" + $scope.track.title + ")")){
        var index = $scope.arrangement.tracks.indexOf($scope.track);
        if(index > -1){
          $scope.arrangement.tracks.splice(index, 1);
        }
      }
    };
}]);