var WebRTCSession = require('../models/webrtc_session');

module.exports = {
  show: function(req, res){
    var arrangementId = req.params.arrangement_id;

    WebRTCSession.get(arrangementId, function(err, session){
      if(session){
        var sessionId = session.session_id;
        console.log({ session_id: sessionId, token: WebRTCSession.generateToken(sessionId) })
        res.json({ session_id: sessionId, token: WebRTCSession.generateToken(sessionId) });
      }else{
        WebRTCSession.create(arrangementId, function(err, newSession){
          var sessionId = newSession.session_id;
          res.json({ session_id: sessionId, token: WebRTCSession.generateToken(sessionId) });
        });
      }
    });
  }
};