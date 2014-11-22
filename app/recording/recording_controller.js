app.controller('RecordingController', ['$scope', 'SharedAudioContext', 'Arrangement', 'BufferedRecordingNode', 'FileBrowser',
  function($scope, SharedAudioContext, Arrangement, BufferedRecordingNode, FileBrowser){
    var audioStream, audioInput, analyser, gainControl;

    // Stops all streams and the recording
    var stopRecording = function(){
      if($scope.recorder)
        $scope.recorder.stop();

      gainControl.disconnect();
      analyser.disconnect();
      audioInput.disconnect();
      audioStream.stop();
      $scope.isRecording = false;
    };

    var cleanUp = function(){
      $scope.isUploading = false;
      $scope.uploadProgress = 0;
      $scope.speakers = false;
      $scope.analyser = null;
      $scope.showRecording = false;
      $scope.file = null;
      $scope.recorder = null;
      $scope.recordedNode = null;
    };

    $scope.uploadRecording = function(){
      $scope.isUploading = true;
      Arrangement.uploadBuffer($scope.file).then(function(uploadedFile){
        FileBrowser.setActiveFile(uploadedFile.name);
        FileBrowser.show();
        $scope.cancelRecording();
      }, function(err){
        console.log('There was an error!', err);
      }, function(percent){
        $scope.uploadProgress = percent;
      });
    };

    $scope.triggerRecording = function(){
      if($scope.isRecording){
        $scope.recorder.exportWAV(function(file){
          $scope.file = file;
          $scope.file.name = "new_recording_" + Date.now();
          var fileReader = new FileReader();
          fileReader.onload = function(){
            var arrBuffer = this.result;
            SharedAudioContext.getContext().decodeAudioData(arrBuffer, function(buffer){
              $scope.$apply(function(){
                $scope.recordedNode = new BufferedRecordingNode({}, buffer);
              });
            })
          };
          fileReader.readAsArrayBuffer(file);
        });

        stopRecording();
      }else{
        $scope.isRecording = true;
        $scope.recorder = new Recorder(analyser, {
          workerPath: '/workers/recorderWorker.js'
        });
        $scope.recorder.record();
      }
    };

    $scope.cancelRecording = function(){
      stopRecording();
      cleanUp();
      $scope.removeAdditionalContent();
    };

    $scope.playRecording = function(){
      if(!$scope.recordedNode) return;
      if($scope.recordedNode.isPlaying())
        $scope.recordedNode.stop();
      else
        $scope.recordedNode.play()
    }

    $scope.$watch('speakers', function(){
      if (!gainControl) return;
      if($scope.speakers){
        gainControl.connect(SharedAudioContext.getContext().destination);
      }else{
        gainControl.disconnect();
      }
    })

    // ask for microphone access
    navigator.getUserMedia({audio: true}, function(stream){
      var context = SharedAudioContext.getContext();
      audioStream = stream;
      audioInput = context.createMediaStreamSource(audioStream);
      analyser = context.createAnalyser();

      audioInput.connect(analyser);
      gainControl = context.createGain();
      gainControl.gain.value = 1;
      audioInput.connect(gainControl);
      if($scope.speakers)
        gainControl.connect(context.destination);

      $scope.$apply(function(){
        $scope.analyser = analyser;
      });
    },function(err){
      // TODO: add proper error handling, especially for the case when users accidentally block the mic
      alert('We did not get access to your microphone, please reload and allow access again!');
    });

}]);