var fs = require('fs');
var util = require('util');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fileName = './data/data.txt';

function logger() {
  console.log.apply(console, arguments);
}

app.get('/', function(req, res){
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
  logger('Socket connected');
  socket.on('message', function(d) {
    // Format the data a little.
    var writeString = util.format("%d,%s\n", Date.now(), d)
    fs.appendFile(fileName, writeString, function(e) {
      if (e) {
        logger('Problem:', e);
      }
    });
    io.emit('message', d);
  });
});

http.listen(3000, function(){
  logger('listening on *:3000');
});
