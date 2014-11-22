$(function(){
  var context = new AudioContext();
  var buffers = {};
  var sets = ['a', 'b', 'c', 'd', 'e'];
  var files = ['a', 'b', 'c', 'd', 'e', 'f'];
  var allLoaded = function(){};
  var fileNum = 0;
  var decodeTimeSum = 0;
  var startToEndTime = 0;

  var loadFileIntoBufferHash = function(file){
    if(startToEndTime === 0) startToEndTime = Date.now();
    fileNum++;
    var startLoad = Date.now();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {

      var decodeStart = Date.now();
      context.decodeAudioData(xhr.response, function(buffer) {
        var decodeTime = Date.now() - decodeStart;
        decodeTimeSum += decodeTime
        buffers[file] = buffer;
        fileNum--;
        if(fileNum == 0){
          startToEndTime = Date.now() - startToEndTime;
          console.log('Decoding time sum:', decodeTimeSum, 'ms');
          console.log('Start to end time:', startToEndTime, 'ms');
          $('#files').show();
          allLoaded();
        }

      });
    };
    xhr.send();
  };

  var playBuffer = function(bufferIndex, offset, duration){
    if(!offset) offset = 0;
    if(!duration) duration = 1;
    var source = context.createBufferSource();
    source.buffer = buffers[bufferIndex];
    source.gain.value = .2;
    source.connect(context.destination);
    source.start(0, offset, duration);
  };

  $('#sprites').click(function(){
    $(this).prop('disabled', true);
    $('#individual').hide();

    allLoaded = function(){
      sets.forEach(function(set){
        files.forEach(function(file, index){
          $('#' + [set, file].join('_')).click(function(){
            playBuffer('sounds/set_' + set + '.wav', index, 1);
          });
        });
      });
    };

    sets.forEach(function(set){
      loadFileIntoBufferHash('sounds/set_' + set + '.wav');
    });
  });

  $('#individual').click(function(){
    $(this).prop('disabled', true);
    $('#sprites').hide();

    allLoaded = function(){
      sets.forEach(function(set){
        files.forEach(function(file){
          $('#' + [set, file].join('_')).click(function(){
            playBuffer('sounds/set_' + set + '_' + file + '.wav');
          });
        });
      });
    };

    sets.forEach(function(set){
      files.forEach(function(file){
        loadFileIntoBufferHash('sounds/set_' + set + '_' + file + '.wav'); 
      });
    });
  });
});