'use strict';
var fs = require('fs');
var util = require('util');
var ws = require('nodejs-websocket');
var fileName = './data/data.txt';

function logger() {
  console.log.apply(console, arguments);
}
var port = 3001;

function broadcast(server, msg) {
  server.connections.forEach(function (conn) {
    conn.sendText(msg)
  })
}

var server = ws.createServer(function (conn) {
  logger('New connection');

  conn.on('text', function (str) {
    broadcast(server, str);
    var writeString = util.format("%d,%s\n", Date.now(), str)
    fs.appendFile(fileName, writeString, function(e) {
      if (e) {
        logger('Problem:', e);
      }
    });
  });
  conn.on('error', function(e) {
    logger('Error', e);
  });

  // When the client closes the connection, notify us
  conn.on("close", function (code, reason) {
    logger('Connection closed')
  });
}).listen(port);
server.on('error', function(e) {
  logger('Server error', e);
});
logger('listening on port', port);
if (process.argv[2] == 'play') {
  // Read file and start to emit from it.
  var linesToEmit = fs.readFileSync('./data/data.txt').toString().split("\n");
  var currentLine = 0;
  var emit = function() {
    var line = linesToEmit[currentLine].split(',');
    broadcast(server, line[1]);
    console.log('broadcast', line[1]);
    currentLine++;
    setTimeout(emit, linesToEmit[currentLine].split(',')[0] - line[0]);
  }
  emit();
}
