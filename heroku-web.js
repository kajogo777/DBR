var gzippo = require('gzippo');
var express = require('express');
var app = express();
var morgan = require('morgan');
var logger = morgan('combined');
var fs = require('fs');
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
app.use(morgan({combinedstream: accessLogStream}));
app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.listen(process.env.PORT || 5000);
console.log("app started");

var mongoose = require('mongoose');
var DB_URI = "mongodb://admin:admin@ds147964.mlab.com:47964/dbr";
var bodyParser = require('body-parser');
// var Router = express.Router();
var path = require('path');
app.use(require('serve-static')(path.resolve('public')));
app.use(bodyParser.urlencoded({ extended: false })); //this line must be on top of app config
app.use(bodyParser.json());

mongoose.connect(DB_URI);
console.log("connecting to global db..");


app.post('/login', function (req, res) {
    console.log(req.body);
    res.send("success");
    // Money.findOne({}, {}, { sort: { '_id': -1 } }, function (err, money) {
    //   res.send(money);
    // });
  });
  