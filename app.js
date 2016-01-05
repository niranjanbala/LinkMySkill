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
    var compression = require('compression')
    var app = express();
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