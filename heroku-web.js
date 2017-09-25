var gzippo = require('gzippo');
var express = require('express');
var app = express();
var morgan = require('morgan');
var logger = morgan('combined');
var fs = require('fs');
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' })
app.use(morgan({ combinedstream: accessLogStream }));
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

app.options('/*', function (req, res) {
    res.sendStatus(200);
  });


var User = require("./Models/User");
app.post('/login', function (req, res) {
    // console.log(req.body);
    var input_pass=  req.body.password;
    if(!req.body.username){
        res.status(201).send("Username required!");
    }
    if(!req.body.password){
        res.status(201).send("Password required!");
    }
    User.findOne({ 'username': req.body.username.toLowerCase() }, function (err, user) {
        if (err) {
            res.status(400);
        } else {
            if (user) {
                if (input_pass && user.password.toUpperCase() == input_pass.toUpperCase()) {
                    res.send(user);
                } else {
                    res.status(201).send("Wrong password!");
                }
            } else {
                res.status(201).send("Wrong username!");
            }

        }
    });
});

app.post('/get_user', function (req, res) {

    User.findOne({ '_id': req.body.id}, function (err, user) {
        if (err) {
            res.status(400);
        } else {
            if (user) {
                    res.send(user);
            } 
        }
    });
});

var Level = require("./Models/Level");
app.post('/next_level', function (req, res) {
     console.log(req.body);
    Level.findOne({ "number": req.body.level}, function (err, level) {
        if (err) {
            res.status(400);
        } else {
            console.log(level);
            if (level) {
                    res.send(level);
            } 
        }
    });
});

var Reading = require("./Models/reading");
app.post('/get_today_reading', function (req, res) {
     
    var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
    
    startDate.setSeconds(0);
    startDate.setHours(0);
    startDate.setMinutes(0);
    
    var dateMidnight = new Date(startDate);
    dateMidnight.setHours(23);
    dateMidnight.setMinutes(59);
    dateMidnight.setSeconds(59);

    Reading.findOne({ "date": {
        $gt:startDate,
        $lt:dateMidnight
        }}, function (err, reading) {
        if (err) {
            res.status(400);
        } else {
            console.log(reading);
            if (reading) {
                    res.send(reading);
            } 
        }
    });
});


app.post('/check_answer', function (req, res) {
    console.log(req.body);
   User.findOne({"_id":req.body.user_id},function(err,user){
       if(err){
           res.send(err);
           return;
       }else
       if(user){
           //checking if question is answered before
           for(var i=0;i< user.answered_questions.length;i++){
                if(user.answered_questions[i].question_id == req.body.question_id){
                    console.log("Already answered this question before !");
                    res.status(201).send("Already answered this question before !");
                    return;
                }
           }
           //if not check for answer and add it in the answered quesions
           Reading.findOne({"_id":req.body.reading_id},function(err,reading){
               if(err){
                   console.log("error");
               }else{
                   for(var j=0;j<reading.questions.length;j++){
                       console.log(req.body.question_id);
                       console.log(reading.questions[j].score);
                       if(req.body.question_id==reading.questions[j].id){
                           console.log(reading.questions[j].id);
                           if(reading.questions[j].answer==req.body.choice){
                                var question={
                                    question_id: req.body.question_id,
                                    right_answer: true,
                                    date:Date.now()
                                  }
                                var question_score = reading.questions[j].score;
                                User.updateOne({"_id":req.body.user_id},{"score":parseInt(user.score)+parseInt(reading.questions[j].score), $push: { "answered_questions": question }},function(err){
                                    res.status(202).send("+"+question_score+" points");
                                    return;
                                })
                           }else{
                               //pushing that the answer was wrong
                            var question={
                                question_id: req.body.question_id,
                                right_answer: false,
                                date:Date.now()
                              }
                            User.updateOne({"_id":req.body.user_id},{ $push: { "answered_questions": question }},function(err){
                               res.status(203).send("Wrong Answer");
                               return;
                            })
                           }
                       }
                   }
               }
           })
       }
   })
});
