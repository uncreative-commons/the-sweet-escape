
var app = require('http').createServer(handler);
var http = require('http')
  , url = require('url')
  , path = require('path')
  , io = require('socket.io').listen(app)
  , fs = require('fs');

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};
    
app.listen(process.env.PORT || 80);

function handler (req, res) {
  var uri = url.parse(req.url).pathname;
  if(uri=="/") uri="/index.html";
  var filename = path.join(process.cwd()+"/public", unescape(uri));
  var stats;

  try {
    stats = fs.lstatSync(filename); // throws if path doesn't exist
  } catch (e) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found\n');
    res.end();
    return;
  }


  if (stats.isFile()) {
    // path exists, is a file
    var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
    res.writeHead(200, {'Content-Type': mimeType} );

    var fileStream = fs.createReadStream(filename);
    fileStream.pipe(res);
  } else if (stats.isDirectory()) {
    // path exists, is a directory
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Index of '+uri+'\n');
    res.write('TODO, show index?\n');
    res.end();
  } else {
    // Symbolic link, other?
    // TODO: follow symlinks?  security?
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.write('500 Internal server error\n');
    res.end();
  }
}
var Rooms = {};
var counter=0;
setInterval(function(){
	io.sockets.emit("heartbeat",counter++);
},1000);  
io.sockets.on('connection', function (socket) {
  var roomId = socket.handshake.query.roomId;
  if(!roomId) roomId=0;
  if(!Rooms[roomId]){ Rooms[roomId] = {clients:{},objects:{},enabled:{}};}
  var room = Rooms[roomId];
  var sid = socket.id;
  room.clients[sid]={};
  socket.emit('objects', room.objects);
  socket.emit('enabled', room.enabled);
  socket.emit('state', room.clients);
  socket.emit('whoami', sid);
  
  socket.on('change', function (data) {
	var t = {};
	t[sid] = data;
	room.clients[sid] = data;
	for(i in room.clients){
		if(i!=sid){
			io.sockets.socket(i).emit("state",t);
	    }
	}
  });
  socket.on('behavior', function (data) {
	for(i in room.clients){
		if(i!=sid){
			io.sockets.socket(i).emit("behavior",data);
	    }
	}
  });
  
  socket.on('object', function (data) {
	var t = {};
	for(var i in data){
		t[i] = data[i];
		room.objects[i] = data[i];
	}
	for(var i in room.clients){
		if(i!=sid){
			io.sockets.socket(i).emit("objects",t);
	    }
	}
  });
  socket.on('enabled', function (data) {
	  for(var i in data){
		room.enabled[i] = data[i];
	  }
  });
  
  socket.on('disconnect', function (data) {
    delete room.clients[sid];
    var count = 0;
    for(i in room.clients){
		count ++;
		io.sockets.socket(i).emit("remove",sid);
	}
    if (count == 0)
	delete Rooms[roomId];
  });
});
