var context = new AudioContext();

// simple model that interfaces a gain node
var MasterNodeModel = Model.extend({
  initialize: function(){
    var context = this.get('context');
    var merger = context.createChannelMerger();
    this.input = merger;

    this.gainNode = context.createGain();
    this.input.connect(this.gainNode);

    this.gainNode.connect(context.destination);
  },

  setGain: function(gain){
    console.log(gain)
    this.gainNode.gain.value = gain;
  }
});

var master = new MasterNodeModel({context: context})

// initialize the tracks
var t1 = new BufferedNode({
  location: '../../shared/sounds/daftperiment3.mp3',
  context: context,
  master: master
});

var t2 = new BufferedNode({
  location: '../../shared/sounds/gema.mp3',
  context: context,
  master: master
});

var t3 = new BufferedNode({
  location: '../../shared/sounds/wearetherejects-2.mp3',
  context: context,
  master: master
});

var VIEWOPTIONS = new Backbone.Model({
  pixelsPerSecond: 10
});

var BufferTrackView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(VIEWOPTIONS, 'change', this.render);
  },

  render: function() {
    debugger
  }
});

new BufferTrackView();

// simple view that changes the gain of a channel
var GainTrackView = Backbone.View.extend({
  events: {
    'change': 'changeGain'
  },

  changeGain: function(){
    this.model.setGain(parseFloat(this.$el.val(), 10));
  }
});

// load the track
$.when(t1.fetch(), t2.fetch(), t3.fetch()).then(function(){
  var v1 = new GainTrackView({el: $('#track1'), model: t1});
  var v2 = new GainTrackView({el: $('#track2'), model: t2});
  var v3 = new GainTrackView({el: $('#track3'), model: t3});

  var masterV = new GainTrackView({el: $('#master'), model: master});

  $('#play').attr('disabled', false).click(function(){
    t1.play();
    t2.play();
    t3.play();  
  });

  $('#pixelsPerSecond').on('change', function(){
    VIEWOPTIONS.set('pixelsPerSecond', parseInt(this.value, 10));
  })
});