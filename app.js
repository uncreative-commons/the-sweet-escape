var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);
function handler (req, res) {
  fs.readFile(__dirname + '/public/test.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
var Rooms = {};
io.sockets.on('connection', function (socket) {
  var roomId = socket.handshake.query.roomId;
  if(!roomId) roomId=0;
  if(!Rooms[roomId]){ Rooms[roomId] = {};}
  var room = Rooms[roomId];
  var sid = socket.id;
  room[sid]={};
  socket.emit('state', room);
  socket.emit('whoami', sid);
  socket.on('change', function (data) {
    var t = {};
	t[sid] = data;
	room[sid] = data;
	for(i in room){
		if(i!=sid){
			io.sockets.socket(i).emit("state",t);
	    }
	}
  });
  socket.on('disconnect', function (data) {
    delete room[sid];
    for(i in room){
		io.sockets.socket(i).emit("state",room);
	}
  });
});
