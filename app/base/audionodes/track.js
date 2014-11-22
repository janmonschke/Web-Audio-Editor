app.factory('Track', ['BaseAudioNode', 'Arrangement',
    function(BaseAudioNode, Arrangement){

  return BaseAudioNode.extend({
    constructor: function(data){
      this.data = data;

      // sanitize gain value
      if(this.data.gain == undefined)
        this.data.gain = 1;

      this.context = Arrangement.context;
      this.in = this.context.createGain();
      this.in.gain.value = this.data.gain;
      this.in.connect(Arrangement.master);
    }
  });

}]);