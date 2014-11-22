/**
 * Generates IDs for the components
 */
app.service('IDGenerator', function(){
  return {
    /**
     * Generates a String ID
     * @param  {String} base prefix for the id
     */
    generate: function(base){
      var id = base ? base + '_' : '';
      var date = Date.now();
      var r = Math.random() * 999999;
      id += Math.random() * (date * r);
      return id;
    }
  }
});