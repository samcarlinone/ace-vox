var port = (process.env.PORT || 8000);

var http    = require('http');
var express = require('express');
var app     = express();

var home = process.env.RELEASE_DIR || 'public';
console.log(process.env.RELEASE_DIR);
console.log(home);
app.use(express.static(home));

var server  = http.createServer(app);
server.listen(port);
