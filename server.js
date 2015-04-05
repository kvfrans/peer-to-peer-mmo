
var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000, path: '/peer-to-peer-mmo'});
console.log("Server Running");

server.on('connection', function (id) {


});