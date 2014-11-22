app.directive('synthesizerPieceEdit', ['$compile', 'EditorConfig',
    function($compile, EditorConfig) {


  var keyToKey = {
    65: 'Cl',
    87: 'C#l',
    83: 'Dl',
    69: 'D#l',
    68: 'El',
    70: 'Fl',
    84: 'F#l',
    71: 'Gl',
    90: 'G#l',
    72: 'Al',
    85: 'A#l',
    74: 'Bl',
    75: 'Cu',
    79: 'C#u',
    76: 'Du',
    80: 'D#u',
    186: 'Eu',
    222: 'Fu',
    221: 'F#u',
    220: 'Gu'
  };

  var startOctave = '3';

  return {
    restrict: 'A',
    templateUrl: 'pieces/synthesizer_piece_edit.html',
    // controller: 'DrumPieceEditController',
    link: function(scope, element, attrs){
      var playNote = function(event){
        if(keyToKey[event.keyCode]){
          var note = keyToKey[event.keyCode].replace('l', startOctave).replace('u', (parseInt(startOctave, 10) + 1).toString());
          if(!scope.node.playingNotes[note])
            scope.node.playNote(note);
        }
      };

      var stopNote = function(event){
        if(keyToKey[event.keyCode]){
          var note = keyToKey[event.keyCode].replace('l', startOctave).replace('u', (parseInt(startOctave, 10) + 1).toString());
          if(scope.node.playingNotes[note])
            scope.node.stopNote(note);
        }
      };

      window.addEventListener('keydown', playNote);
      window.addEventListener('keyup', stopNote);

      element.on('$destroy', function(){
        window.removeEventListener('keydown', playNote);
        window.removeEventListener('keyup', stopNote);
      });
    }
  }
}]);