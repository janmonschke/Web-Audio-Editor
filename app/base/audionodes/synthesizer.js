app.factory('Synthesizer', ['BaseAudioNode', 'BufferLoader', '$q', 'Arrangement',
    function(BaseAudioNode, BufferLoader, $q, Arrangement){

  var _oscillators = [];
  var getNewOscillator = function(context){
    var osc = context.createOscillator();
    var gain = context.createGain();
    osc.connect(gain);
    return { osc: osc, gain: gain };
  };

  var releaseOscillator = function(osc){

  };


  return BaseAudioNode.extend({
    oscillatorTypes: ['sine', 'square', 'sawtooth', 'triangle'],
    filterTypes: ['lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'],
    notes: ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'],

    constructor: function(data){
      this.playingNotes = {};
      this.data = data;
    },

    setup: function(){
      this.setupNodes();
      this.setupSettings();
      this.wireUpNodes();
    },

    setupNodes: function(){
      this.lfo = this.context.createOscillator();
      this.lfo.start(0);
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.connect(this.master);
      this.osc1Gain = this.context.createGain();
      this.osc2Gain = this.context.createGain();
      this.osc3Gain = this.context.createGain();
      this.filter = this.context.createBiquadFilter();
    },

    setupSettings: function(){
      var settings = this.data.synthSettings;
      // LFO
      this.lfo.frequency.value = parseInt(settings.lfo.frequency, 10);
      this.lfo.type = settings.lfo.type;
      // OSCGAIN
      this.osc1Gain.gain.value = parseFloat(settings.osc1.gain);
      this.osc2Gain.gain.value = parseFloat(settings.osc2.gain);
      this.osc3Gain.gain.value = parseFloat(settings.osc3.gain);
      // FILTER
      this.filter.frequency.value = parseInt(settings.filter.frequency, 10);
      this.filter.type = settings.filter.type;
    },

    wireUpNodes: function(){
      this.osc1Gain.disconnect();
      this.osc2Gain.disconnect();
      this.osc3Gain.disconnect();
      this.filter.disconnect();

      // connect to the filter only of activated
      if(this.data.synthSettings.filter.activate){
        this.osc1Gain.connect(this.filter);
        this.osc2Gain.connect(this.filter);
        this.osc3Gain.connect(this.filter);
        this.filter.connect(this.compressor);
      }else{
        this.osc1Gain.connect(this.compressor);
        this.osc2Gain.connect(this.compressor);
        this.osc3Gain.connect(this.compressor);
      }
    },

    setupOscillator: function(oscillator, index){
      var settings = this.data.synthSettings;
      var currentOscSettings = settings['osc'+index];
      oscillator.type = currentOscSettings.type;
      oscillator.detune.value = parseFloat(currentOscSettings.detune);
    },

    wireUpOscillator: function(oscillator, index){
      oscillator.connect(this['osc'+index+'Gain']);
    },

    length: function(){
      var length = 0;
      this.data.tones.forEach(function(tone){
        var currLength = tone.position + tone.duration;
        length = currLength > length ? currLength : length;
      });
      return length;
    },

    play: function(when, offset, forcedTime){
      if(!when){ when = 0; } // start immediately if not defined
      if(!offset){ offset = 0; } // no offset by default

      this.startedAt = this.context.currentTime + when;
      this.startedAtWithoutOffset = this.startedAt - offset;
      this.offset = offset;

      console.log('TODO: calculate offset');

      this.data.tones.forEach(function(tone){
        var start = when + tone.position;
        var end = start + tone.duration;
        this.playNote(tone.note, start, end);
      }.bind(this));
    },

    playNote: function(note, when, end){
      console.log('when', when ,'end', end);
      // if not specified, play now
      if(when == undefined) when = 0;

      var oscillators = [getNewOscillator(this.context), getNewOscillator(this.context), getNewOscillator(this.context)];
      var frequency = this.noteToFrequency(note);
      var envelopeSettings = this.data.synthSettings.toneEnvelope;
      var now = this.context.currentTime;
      var startTime = now + when;
      var endTime = (end != undefined) ? end + now : undefined;

      var attack = parseFloat(envelopeSettings.attack);
      var decay = parseFloat(envelopeSettings.decay);
      var release = parseFloat(envelopeSettings.release);

      var sustain = Math.min(parseFloat(envelopeSettings.sustain), 1);
      var peak = Math.min(sustain + parseFloat(envelopeSettings.boost), 1);

      // calculate the time of the sustain length of the tone minus the envelope times
      var sustainLength = 0;
      var length = 0;
      if(end != undefined){
        sustainLength = end + now - startTime;
        sustainLength = sustainLength - attack - decay - release;
        length = end - when;
      }

      // calculate envelope times
      var peakTime = startTime + attack;
      var decayTime = peakTime + decay;
      var sustainTime = decayTime + sustainLength;
      var releaseTime = sustainTime + release;

      var endsDuringAttack = (endTime != undefined) ? (peakTime > endTime) : false;
      var endsDuringDecay = (endTime != undefined) ? (decayTime > endTime) : false;
      var endsDuringSustain = (endTime != undefined) ? (sustainTime > endTime) : false;
      var endsDuringRelease = (endTime != undefined) ? (releaseTime > endTime) : false;

      console.log(envelopeSettings.attack, envelopeSettings.decay, length, envelopeSettings.release);
      console.log(peakTime, decayTime, sustainTime, releaseTime);

      for(var i = 0; i < 3; i++){
        var osc = oscillators[i].osc;
        var gain = oscillators[i].gain;
        this.setupOscillator(osc, i+1);
        this.wireUpOscillator(gain, i+1);
        osc.frequency.value = frequency;
        this.lfo.connect(osc.frequency);

        gain.gain.cancelScheduledValues(startTime);
        gain.gain.setValueAtTime(0, startTime);

        // attack
        if(!endsDuringAttack){
          gain.gain.linearRampToValueAtTime(peak, peakTime);
        }else{
          var stopTime = peakTime - (peakTime - endTime);
          gain.gain.linearRampToValueAtTime(peak, stopTime);
          gain.gain.setValueAtTime(0, stopTime + 0.01);
        }
        // decay
        if(!endsDuringAttack && !endsDuringDecay){
          gain.gain.linearRampToValueAtTime(sustain, decayTime);
        }else{
          var stopTime = decayTime - (decayTime - endTime);
          gain.gain.linearRampToValueAtTime(sustain, stopTime);
          gain.gain.setValueAtTime(0, stopTime + 0.01);
        }
        // sustain
        if(!endsDuringAttack && !endsDuringDecay && !endsDuringSustain){
          gain.gain.setValueAtTime(sustain, sustainTime);
        }else{
          var stopTime = sustainTime - (sustainTime - endTime);
          gain.gain.setValueAtTime(sustain, stopTime);
          gain.gain.setValueAtTime(0, stopTime + 0.01);
        }

        if(end != undefined){
          // release
          if(!endsDuringAttack && !endsDuringDecay && !endsDuringSustain && !endsDuringRelease){
            gain.gain.linearRampToValueAtTime(0, releaseTime);
          }else{
            var stopTime = releaseTime - (releaseTime - endTime);
            gain.gain.setValueAtTime(0, stopTime);
          }
        }

        osc.start(startTime);
      }

      this.playingNotes[note] = oscillators;
    },

    stop: function(){
      Object.keys(this.playingNotes).forEach(function(note){
        this.disconnectOscillators(this.playingNotes[note]);
      }.bind(this))
      this.playingNotes = {};
    },

    stopNote: function(note){
      this.disconnectOscillators(this.playingNotes[note])
      delete this.playingNotes[note];
    },

    disconnectOscillators: function(oscillators){
      if(!oscillators) return;

      oscillators.forEach(function(oscObject){
        try{
          oscObject.gain.disconnect();
          oscObject.gain = null;
          oscObject.osc.stop(0);
          oscObject.osc.disconnect();
          oscObject.osc = null;
        }catch(e){
          console.log('error disconnecting oscillators', e);
        }
      });

      oscillators = null;
    },

    loop: function(offset){

    },

    tonesByNote: function(note){
      return _.where(this.data.tones, {note: note});
    },

    // converts notes to frequencies, taken from:
    //  Qwerty Hancock keyboard library v0.3
    //  Copyright 2012-13, Stuart Memo
    //
    //  Licensed under the MIT License
    //  http://opensource.org/licenses/mit-license.php
    noteToFrequency: function (note) {
      var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
          key_number,
          octave;

      if (note.length === 3) {
          octave = note.charAt(2);
      } else {
          octave = note.charAt(1);
      }

      key_number = notes.indexOf(note.slice(0, -1));

      if (key_number < 3) {
          key_number = key_number + 12 + ((octave - 1) * 12) + 1;
      } else {
          key_number = key_number + ((octave - 1) * 12) + 1;
      }

      return 440 * Math.pow(2, (key_number - 49) / 12);
    }
  });

}]);