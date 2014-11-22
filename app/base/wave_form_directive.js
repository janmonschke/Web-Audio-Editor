app.directive('waveForm', ['$rootScope', '$compile', 'EditorConfig',
  function($rootScope, $compile, EditorConfig) {

  var renderWaveForm = function(node, canvas, options){
    var pixelsPerSecond = EditorConfig.pixelsPerSecond;
    var height = 80;
    var width = node.length() * pixelsPerSecond;
    var channelData = node.buffer.getChannelData(0);
    var length = channelData.length;
    var stepSize = Math.ceil(length / width);

    var skipSteps = 0;

    // recalculate steps and skips when there are offsets
    if(options.ignoreOffsets){
      // the width should be the original width
      width = node.buffer.duration * pixelsPerSecond;
      // recalculate the stepSize, because width might have changed
      stepSize = Math.ceil(length / width);
    }else{
      if(node.data.offsetStart || node.data.offsetEnd){
        // calculate the offsets into the channel's coordination system
        var offsetLength = ((node.data.offsetStart + node.data.offsetEnd) * node.context.sampleRate);
        var offsetStartLength = (node.data.offsetStart * node.context.sampleRate);
        // take the offsetLength from the cahnnel length to recalculate the stepSize
        stepSize = Math.ceil((channelData.length - offsetLength) / width);
        // calculate the amount of steps to skip from the offsetStartLength
        skipSteps = Math.floor(offsetStartLength / stepSize);
      }
    }

    var heigtOffset = height / 2;
    var canvasContext = canvas[0].getContext('2d');

    // setup the canvas size
    canvas.prop('width', width);
    canvas.prop('height', height);
    // clear the canvas
    canvasContext.clearRect(0, 0, width, height);

    var min, max, currentValue;
    for(var i = 0; i < width; i++){
      min = 1; max = -1;

      // determine min and max for current section
      for(var j = 0; j < stepSize; j++){
        currentValue = channelData[(i + skipSteps) * stepSize + j];
        min = currentValue < min ? currentValue : min;
        max = currentValue > max ? currentValue : max;
      }

      // draw a rectangle from min to max, centered vertically
      if(currentValue)
        canvasContext.fillRect(i, (1 + min) * heigtOffset, 1, (max - min) * heigtOffset);
    }
  };

  return {
    restrict: 'A',
    link: function(scope, element, attributes){
      var options = {
        ignoreOffsets: (attributes.ignoreoffsets != undefined)
      };

      var render = function(){
        renderWaveForm(scope.node, element, options);
        scope.$emit('waveform:rendered');
      };

      var unwatchPixels, unwatchOffsetStart, unwatchOffsetEnd;

      var fetchNode = function(){
        if(!scope.node) return;

        scope.node.fetch().then(function(){
          render();
          unwatchPixels = scope.$watch('config.pixelsPerSecond', function(newv, oldv){
            if(newv != oldv) render();
          });

          unwatchOffsetStart = scope.$watch('piece.offsetStart', function(newv, oldv){
            if(newv != oldv) render();
          });

          unwatchOffsetEnd = scope.$watch('piece.offsetEnd', function(newv, oldv){
            if(newv != oldv) render();
          })
        });  
      };
      
      fetchNode();

      var unwatchNode = scope.$watch('node', function(newv, oldv){
        if(newv != oldv) fetchNode();
      });

      element.on('$destroy', function(){
        unwatchNode();
        if(unwatchPixels) unwatchPixels();
        if(unwatchOffsetStart) unwatchOffsetStart();
        if(unwatchOffsetEnd) unwatchOffsetEnd();
      });
    }
  }
}]);