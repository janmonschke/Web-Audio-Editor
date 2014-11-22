// sanitizes the AudioContext
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// sanitizes getUserMedia
navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;