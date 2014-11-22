app.factory('SharedAudioContext', [function(){
  var context;
  return {
    getContext: function(){
      if(!context)
        context = new AudioContext();
      return context;
    }
  }
}]);