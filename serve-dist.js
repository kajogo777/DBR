var express = require('express');
var app = express();

app.use(express.static("" + __dirname + "/dist"));

var port = 8000;

app.listen(port);

console.log("serving 'dist/' on port " + port + "...");