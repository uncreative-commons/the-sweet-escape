var static = require('node-static');

var fileServer = new static.Server('./public', {
	cache: 0
})
  , port = 8080;

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(port);

console.log("Server listening on port " + port);
