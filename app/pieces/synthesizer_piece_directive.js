app.directive('synthesizerPiece', ['EditorConfig',
    function(EditorConfig) {

  var renderNotes = function(synthNode, element){
    var canvasContext = element[0].getContext('2d');
    var synthData = synthNode.data;
    var width = synthNode.length() * EditorConfig.pixelsPerSecond;
    var height = parseInt(element.prop('height'));
    var heightPerNote = height / synthNode.notes.length;

    element.prop('width', width);

    canvasContext.clearRect(0, 0, width, height);
    canvasContext.fillStyle = '#bada55';

    var currentNote;
    // render each note
    synthNode.notes.forEach(function(note, index){
      // gather all tones from this note
      var tonesFromCurrentNote = _.where(synthData.tones, {note: note});
      tonesFromCurrentNote.forEach(function(tone){
        var noteHeight = index * heightPerNote;
        var xPos = tone.position * EditorConfig.pixelsPerSecond;
        canvasContext.fillRect(
          tone.position * EditorConfig.pixelsPerSecond,
          index * heightPerNote,
          tone.duration * EditorConfig.pixelsPerSecond,
          heightPerNote
        )
      });
    });
  };

  return {
    restrict: 'E',
    templateUrl: 'pieces/synthesizer_piece.html',
    controller: 'SynthesizerPieceController',
    link: function(scope, element, attrs){

      var render = function(){
        renderNotes(scope.node, element.find('canvas'));
      };

      render();

      var unwatchPixels = scope.$watch('config.pixelsPerSecond', function(newv, oldv){
        if(newv != oldv) render();
      });

      var unwatchTones = scope.$watch('piece.tones', function(newv, oldv){
        if(newv != oldv) render();
      }, true);

      element.on('$destroy', function(){
        unwatchPixels();
        unwatchTones();
      });

    }
  }
}]);