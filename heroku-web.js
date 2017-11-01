var gzippo = require('gzippo');
var express = require('express');
var app = express();
var morgan = require('morgan');
var logger = morgan('combined');
var fs = require('fs');
var cors = require('cors');
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' })
app.use(morgan({ combinedstream: accessLogStream }));
app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.listen(process.env.PORT || 5000);
app.use(cors());
console.log("app started");

var mongoose = require('mongoose');
var DB_URI = "mongodb://admin:admin@ds147964.mlab.com:47964/dbr";
var bodyParser = require('body-parser');
// app.use(express.static('../public'))
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
var Trophy = require("./Models/Trophy");
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
    User.findOne({ '_id': req.body.id }).populate("trophies.trophy").exec(function (err, user) {
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

var Reading = require("./Models/Reading");
//getting date by today's date ... 
/*
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
*/

function AddPoints(user, points, callback) {//get user object and points to add and return new user updated object,new level flag

    Level.findOne({ 'number': parseInt(user.level) + 1 }, function (err, level) {
        var new_level = user.level;
        var new_level_score = parseInt(user.level_score) + parseInt(points);
        var level_changed = false;
        // console.log(level.needed_score);
        // console.log(new_level_score);
        if (level.needed_score <= new_level_score) {
            // console.log("hi");
            new_level = user.level + 1;
            new_level_score = new_level_score - level.needed_score;
            level_changed = true;
        }
        //adding score
        User.findOneAndUpdate({ "_id": user._id }, {
            "total_score": parseInt(user.total_score) + parseInt(points),
            "level_score": new_level_score,
            "level": new_level,
        }, function (err, user_updated) {
            callback(err, user_updated, level_changed);
        })
    });
};


function CheckTrophies(user, type, callback) {//get user object and trophies type to check and return new user updated object,new trophy
    User.findOne({ '_id': user._id },function(err,user){
        //get trophies of needed type 
        Trophy.find({ type: type }, (err, trophies) => {
            //excluding trophies that are already taken by user
            user_trophies = user.trophies;
            for (i = 0; i < trophies.length; i++) {
                for (j = 0; j < user_trophies.length; j++) {
                    if (trophies[i]._id.equals(user_trophies[j].trophy)) {
                        trophies.splice(i, 1);
                        break;
                    }
                }
            }

            earnedNewTrophy = false;
            if (type == "reading_days") {//check of trophies type reading bible for x days
                //checking if one of the trophies is achieved if its value is equal to number of readings of user
                var readings_num = user.reading_dates.length;
                for (i = 0; i < trophies.length; i++) {
                    if (readings_num == trophies[i].value) {
                        
                        earnedNewTrophy=true;
                        user_new_trophy = {
                            trophy: trophies[i]._id,
                            date: new Date(Date.now())
                        }
                        trophy_score = trophies[i].points;
                        AddPoints(user, trophy_score, function (err, user, trophy_score ){
                            User.findOneAndUpdate({_id:user._id},{ $push: { "trophies": user_new_trophy } },(err,user)=>{
                                callback(err,user,trophies[i]);
                            })
                        })
                        break;
                    }
                }
                if(!earnedNewTrophy){
                    callback(err,user,null);
                }
            }

        })
    });
};

app.post('/get_today_reading', function (req, res) {
    var Today = new Date(Date.now());
    // console.log(req.body.user_id);
    User.findOne({ '_id': req.body.user_id }, function (err, user) {
        if (err)
            console.log(err);
        else {

            //checking for last reading
            var readings_num = user.reading_dates.length;
            if (readings_num != 0) { // if not first time to read
                var last_reading = new Date(user.reading_dates[readings_num - 1]);

                // if next day increment readings_num and push new date
                if (last_reading.toDateString() != Today.toDateString()) {

                    readings_num++;
                    User.updateOne({ '_id': user._id }, { $push: { "reading_dates": Today } }, (err, u) => { });
                }
            } else { // if first time to read
                readings_num++;
                User.updateOne({ '_id': user._id }, { $push: { "reading_dates": Today } }, (err, u) => { console.log(u) });
            }
            
            CheckTrophies(user,"reading_days",function(err,user,newTrophy){
                Reading.findOne({
                    "number": readings_num
                }, function (err, reading) {
                    if (err) {
                        return res.status(400);
                    } else {
                        if(newTrophy != null){
                            return res.status(205),send({reading,newTrophy});
                        }
                        if (reading) {
                            return res.send(reading);
                        }
                    }
                });
            })

        }
    })
});


app.get('/get_reading/:id', function (req, res) {
    Reading.findOne({ '_id': req.params.id }, (err, reading) => { return res.send(reading) })
})

app.get('/get_readings', function (req, res) {
    Reading.find({}, ['number', 'shahed'], (err, readings) => { return res.send(readings) })
})

app.post('/update_reading', function (req, res) {
    var reading = new Reading(req.body.reading);
    Reading.update({ _id: req.body.reading._id }, reading, (err, done) => { return res.send(done) })
})


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
                //if not.. check for answer and add it in the answered quesions
                Reading.findOne({ "_id": req.body.reading_id }, function (err, reading) {
                    console.log('reading: ', reading);
                    if (err) {
                        console.log("error");
                    } else {
                        for (var j = 0; j < reading.questions.length; j++) {
                            // console.log(req.body.question_id);
                            // console.log(reading.questions[j].score);
                            if (req.body.question_id == reading.questions[j].id) {
                                if (reading.questions[j].answer == req.body.choice) {

                                    var question = {
                                        question_id: req.body.question_id,
                                        reading_id: req.body.reading_id,
                                        is_right_answer: true,
                                        user_answer: req.body.choice,
                                        right_answer: reading.questions[j].answer,
                                        question: reading.questions[j].question,
                                        choices: reading.questions[j].choices,
                                        score: reading.questions[j].score,
                                        date: Date.now()
                                    }
                                    var question_score = reading.questions[j].score;

                                    //adding points
                                    AddPoints(user, question_score, function (err, user, isLevelChanged) {
                                        User.updateOne({ "_id": req.body.user_id }, {
                                            $push: { "answered_questions": question }
                                        }, function (err, user_updated) {
                                            if (isLevelChanged) {
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
                                        reading_id: req.body.reading_id,
                                        is_right_answer: false,
                                        user_answer: req.body.choice,
                                        right_answer: reading.questions[j].answer,
                                        question: reading.questions[j].question,
                                        choices: reading.questions[j].choices,
                                        score: reading.questions[j].score,
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

function get_user_date(id) {
    User.findOne({ 'id': id }, function (err, user) {
        if (err)
            console.log(err);
        else
            return user;
    })
}


app.post('/add_reading', function (req, res) {
    console.log(req.body);
    var reading = new Reading(req.body.reading);
    reading.save(function (err, reading) {
        if (err)
            res.send(err);
        else {
            res.send("reading added successfully");
        }
    })
});

app.post('/get_top_5_in_class', function (req, res) {
    User.find({ "class": req.body.class, "admin": { $ne: "true" } }).sort({ "total_score": -1 }).limit(5).exec(function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.send(users);
        }
    })
});

app.post('/get_top_5', function (req, res) {
    User.find({ "admin": { $ne: "true" } }).sort({ "total_score": -1 }).limit(5).exec(function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.send(users);
        }
    })
});

app.post('/add_users', function (req, res) {
    var users_to_be_inserted = [];
    for (var i = 0; i < 50; i++) {
        if (req.body.users[i].name == "")
            break;
        else {
            var birthdate = new Date(req.body.users[i].birthdate);
            var year = birthdate.getFullYear();
            var month = birthdate.getMonth() + 1;
            var day = birthdate.getDate();
            req.body.users[i].password = "" + day + month + year
            users_to_be_inserted.push(req.body.users[i]);
        }
    }
    User.collection.insert(users_to_be_inserted, function (err, docs) {
        if (err) {
            res.send(err);
        } else {
            res.send(users_to_be_inserted.length + ' kids were successfully stored.');
        }
    });
})

app.post('/get_class_users', function (req, res) {
    User.find({ "class": req.body.class, "admin": { $ne: "true" } }, function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.send(users);
        }
    })
})
