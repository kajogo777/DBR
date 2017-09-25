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
   return res.sendStatus(200);
});


var User = require("./Models/User");
app.post('/login', function (req, res) {
    // console.log(req.body);
    var input_pass = req.body.password;
    if (!req.body.username) {
       return res.status(201).send("Username required!");
    }
    if (!req.body.password) {
       return res.status(201).send("Password required!");
    }
    User.findOne({ 'username': req.body.username.toLowerCase() }, function (err, user) {
        if (err) {
           return res.status(400);
        } else {
            if (user) {
                if (input_pass && user.password.toUpperCase() == input_pass.toUpperCase()) {
                   return res.send(user);
                } else {
                    return res.status(201).send("Wrong password!");
                }
            } else {
               return res.status(201).send("Wrong username!");
            }

        }
    });
});

app.post('/get_user', function (req, res) {

    User.findOne({ '_id': req.body.id }, function (err, user) {
        if (err) {
           return res.status(400);
        } else {
            if (user) {
                return res.send(user);
            }
        }
    });
});

var Level = require("./Models/Level");
app.post('/next_level', function (req, res) {
    console.log(req.body);
    Level.findOne({ "number": req.body.level }, function (err, level) {
        if (err) {
           return res.status(400);
        } else {
            console.log(level);
            if (level) {
                return res.send(level);
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

    Reading.findOne({
        "date": {
            $gt: startDate,
            $lt: dateMidnight
        }
    }, function (err, reading) {
        if (err) {
            return res.status(400);
        } else {
            console.log(reading);
            if (reading) {
                return res.send(reading);
            }
        }
    });
});


app.post('/check_answer', function (req, res) {
    console.log(req.body);
    User.findOne({ "_id": req.body.user_id }, function (err, user) {
        if (err) {
            return res.send(err);
            return;
        } else
            if (user) {
                //checking if question is answered before
                for (var i = 0; i < user.answered_questions.length; i++) {
                    if (user.answered_questions[i].question_id == req.body.question_id) {
                        console.log("Already answered this question before !");
                         return res.status(201).send("Already answered this question before !");
                       
                    }
                }
                //if not check for answer and add it in the answered quesions
                Reading.findOne({ "_id": req.body.reading_id }, function (err, reading) {
                    if (err) {
                        console.log("error");
                    } else {
                        for (var j = 0; j < reading.questions.length; j++) {
                            // console.log(req.body.question_id);
                            // console.log(reading.questions[j].score);
                            if (req.body.question_id == reading.questions[j].id) {
                                console.log(reading.questions[j].id);
                                if (reading.questions[j].answer == req.body.choice) {
                                    var question = {
                                        question_id: req.body.question_id,
                                        right_answer: true,
                                        date: Date.now()
                                    }
                                    var question_score = reading.questions[j].score;
                                    
                                    //checking level
                                    Level.findOne({ 'number': parseInt(user.level)+1 }, function (err, level) {
                                        var new_level = user.level;
                                        var new_level_score = parseInt(user.level_score) + parseInt(question_score);
                                        var level_changed = false;
                                        console.log(level.needed_score);
                                        console.log(new_level_score);
                                        if (level.needed_score == new_level_score) {
                                            console.log("hi");
                                            new_level = user.level + 1;
                                            new_level_score = 0;
                                            level_changed = true;
                                        }
                                        //adding score
                                        User.updateOne({ "_id": req.body.user_id }, {
                                            "total_score": parseInt(user.total_score) + parseInt(question_score),
                                            "level_score": new_level_score,
                                            "level": new_level,
                                            $push: { "answered_questions": question }
                                        }, function (err, user_updated) {
                                            if (level_changed) {
                                                   return res.status(204).send("+" + question_score + " points");
                                            } else {
                                                   return res.status(202).send("+" + question_score + " points");
                                            }

                                        })
                                    });

                                } else {
                                    //pushing that the answer was wrong
                                    var question = {
                                        question_id: req.body.question_id,
                                        right_answer: false,
                                        date: Date.now()
                                    }
                                    User.updateOne({ "_id": req.body.user_id }, { $push: { "answered_questions": question } }, function (err) {
                                        return res.status(203).send("Wrong Answer");
                                       
                                    })
                                }
                                break;
                            }
                        }
                    }
                })
            }
    })
});
