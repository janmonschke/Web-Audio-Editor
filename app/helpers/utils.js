app.factory('utils', [function(){
  return {
    /**
     * Returns a copy of the passed object
     * @param  {Object} obj The object that should be copied
     * @return {Object}     the copy
     */
    deepCopy: function(obj){
      return JSON.parse(JSON.stringify(obj));
    }
  };
}]);