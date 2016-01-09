var cluster = require('cluster');
if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
    cluster.on('exit', function (worker) {
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });
} else {
    var express = require('express');
    var compression = require('compression');
    var app = express();
    var passport = require('passport'),
    LinkedInStrategyStrategy = require('passport-linkedin').Strategy;
    passport.use(new LinkedInStrategy({
        consumerKey: "75f6p3bahfcoom",
        consumerSecret: "zWwdVg3oiLoP5Le7",
        callbackURL: "http://linkmyskill.herokuapp.com/auth/linkedin/callback",
        profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
      },
      function(token, tokenSecret, profile, done) {
        done(null, {
            token: token,
            tokenSecret: tokenSecret,
            profile: profile
        });
      }
    ));
    app.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
    app.get('/auth/linkedin/callback', 
        passport.authenticate('linkedin', { failureRedirect: '/auth/linkedin' },
        function(req, res) {
            res.jsonp(req.user);
        });
    //var path = require('path');
    //app.use(express.static(path.join(__dirname, 'public')));
    app.use(compression({filter: shouldCompress}))
    function shouldCompress(req, res) {
        if (req.headers['x-no-compression']) {         
            return false
        }
        return compression.filter(req, res)
    }
    app.set('port', process.env.PORT || 3000);
    app.listen(app.get('port'));
    console.log('Worker ' + cluster.worker.id + ' running!');
}