var gzippo = require('gzippo');
var express = require('express');
var app = express();
var morgan = require('morgan');
var logger = morgan('combined');
var fs = require('fs');
var cors = require('cors');
//app.use(gzippo.staticGzip("" + __dirname + "/dist"));
var path = require('path');
var serveStatic = require('serve-static');
var indexHtml = 'index.html';
var serve = serveStatic(path.resolve('dist'), {
    index: indexHtml,
    setHeaders: setCustomCacheControl,
    // cacheControl: true, //default is true
    // lastModified: true, //default is true
    // etag: true, //default is true
})
function setCustomCacheControl(res, myPath, stat) {
    if (path.parse(myPath).base == indexHtml) {
        //browser must contact the server before
        //serving a cached 'index.html'
        res.setHeader('Cache-Control', 'public, no-cache');
    } else {
        //for all other files, cache for a long duration
        //(to force cache invalidation of these files,
        //you can use gulp-rev for example)
        var dur_in_ms = 2 * 24 * 60 * 60 * 1000; //2 days
        res.setHeader('Cache-Control', 'public, max-age=' + dur_in_ms);
    }
}
app.use(serve);
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' })
app.use(morgan({ combinedstream: accessLogStream }));
app.listen(process.env.PORT || 5000);
app.use(cors());
console.log(">> app started");

var mongoose = require('mongoose');
var DB_URI = "mongodb://admin:admin@ds147964.mlab.com:47964/dbr";
//handle command line arguments
if(process.argv.length > 2){
    console.log('>> Received command line arguments:');
    console.log(process.argv.slice(2));
    if(process.argv[2] == '--dev'){
        console.log('\n>> WARNING: Server running in Dev mode\n');
        DB_URI = "mongodb://localhost/dbr";
    }
}
var bodyParser = require('body-parser');
// app.use(express.static('../public'))
// var Router = express.Router();
app.use(bodyParser.urlencoded({ extended: false })); //this line must be on top of app config
app.use(bodyParser.json());

console.log(">> connecting to db..");
mongoose.connect(DB_URI, {}, function(){
    console.log('>> connected successfully to db');
})


app.options('/*', function (req, res) {
    return res.sendStatus(200);
});



var User = require("./Models/User");
var Trophy = require("./Models/Trophy");
var Gift = require("./Models/Gift");

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
    User.findOne({ '_id': req.body.id }).populate("trophies.trophy").populate("gift").exec(function (err, user) {
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

            //updating level user counter
            Level.updateOne({ _id: level._id }, { '$inc': { 'users_count': '1' } }, () => { });
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
    User.findOne({ '_id': user._id }).populate("trophies.trophy").exec(function (err, user) {
        //get trophies of needed type 
        Trophy.find({ type: type }, (err, trophies) => {
            //excluding trophies that are already taken by user
            user_trophies = user.trophies;
            for (var i = 0; i < user_trophies.length; i++) {
                for (var j = 0; j < trophies.length; j++) {
                    if (trophies[j]._id.equals(user_trophies[i].trophy._id)) {
                        trophies.splice(j, 1);
                        break;
                    }
                }
            }
            // for (i = 0; i < trophies.length; i++) {
            //     for (j = 0; j < user_trophies.length; j++) {
            //         if (trophies[i]._id.equals(user_trophies[j].trophy)) {
            //             trophies.splice(i, 1);
            //             console.log("entered");
            //             break;
            //         }
            //     }
            // }

            earnedNewTrophy = false;
            if (type == "reading_days") {//check of trophies type reading bible for x days
                //checking if one of the trophies is achieved if its value is equal to number of readings of user
                var readings_num = user.reading_dates.length;
                for (i = 0; i < trophies.length; i++) {
                    if (readings_num == trophies[i].value) {

                        earnedNewTrophy = true;
                        user_new_trophy = {
                            trophy: trophies[i]._id,
                            date: new Date(Date.now())
                        }
                        trophy_score = trophies[i].points;
                        //update trophy user counter
                        Trophy.updateOne({ _id: trophies[i]._id }, { '$inc': { 'users_count': '1' } }, () => { });

                        AddPoints(user, trophy_score, function (err, user, LevelChanged) {
                            User.findOneAndUpdate({ _id: user._id }, { $push: { "trophies": user_new_trophy } }, (err, user) => {
                                callback(err, user, trophies[i], LevelChanged);
                            })
                        })
                        break;
                    }
                }
                if (!earnedNewTrophy) {
                    callback(err, user, null);
                }
            }



            if (type == "reading_row") {//check of trophies type reading bible for x days in a row
                //checking if one of the trophies is achieved if its value is equal to number of readings in a row of user
                var row_readings_count = user.row_readings_count;
                for (i = 0; i < trophies.length; i++) {
                    if (row_readings_count == trophies[i].value) {

                        earnedNewTrophy = true;
                        user_new_trophy = {
                            trophy: trophies[i]._id,
                            date: new Date(Date.now())
                        }
                        trophy_score = trophies[i].points;

                        //update trophy user counter
                        Trophy.updateOne({ _id: trophies[i]._id }, { '$inc': { 'users_count': '1' } }, () => { });

                        AddPoints(user, trophy_score, function (err, user, LevelChanged) {
                            User.findOneAndUpdate({ _id: user._id }, { $push: { "trophies": user_new_trophy } }, (err, user) => {
                                callback(err, user, trophies[i], LevelChanged);
                            })
                        })
                        break;
                    }
                }
                if (!earnedNewTrophy) {
                    callback(err, user, null);
                }
            }



            if (type == "correct_answers_row") {//check of trophies type x correct answers in a row
                //checking if one of the trophies is achieved if its value is equal to number of row correct answer of user
                var correct_answers_row = user.row_correct_answer_count;
                for (i = 0; i < trophies.length; i++) {
                    if (correct_answers_row == trophies[i].value) {

                        earnedNewTrophy = true;
                        user_new_trophy = {
                            trophy: trophies[i]._id,
                            date: new Date(Date.now())
                        }
                        trophy_score = trophies[i].points;

                        //update trophy user counter
                        Trophy.updateOne({ _id: trophies[i]._id }, { '$inc': { 'users_count': '1' } }, () => { });

                        AddPoints(user, trophy_score, function (err, user, LevelChanged) {
                            User.findOneAndUpdate({ _id: user._id }, { $push: { "trophies": user_new_trophy } }, (err, user) => {
                                callback(err, user, trophies[i], LevelChanged);
                            })
                        })
                        break;
                    }
                }
                if (!earnedNewTrophy) {
                    callback(err, user, null);
                }
            }



        })
    });
};

//not used
app.get('/correct_row_readings', function (req, res) {
    User.find({ "admin": "0" }, function (err, users) {
        var output = "";
        for (var i = 0; i < users.length; i++) {
            var row_readings_counter = 0;
            console.log('users[i].reading_dates.length: ', users[i].reading_dates.length);
            if (users[i].reading_dates.length == 0) {
                row_readings_counter = 0;
            } else if (users[i].reading_dates.length == 1) {
                row_readings_counter = 1;
            } else {
                var reading_dates = users[i].reading_dates;
                row_readings_counter = 1;
                for (var j = reading_dates.length - 1; j >= 1; j--) {
                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

                    var diffDays = Math.floor(Math.abs((reading_dates[j].getTime() - reading_dates[j - 1].getTime()) / (oneDay)));
                    console.log('diffDays: ', diffDays);
                    if (diffDays > 1)
                        break;
                    else
                        row_readings_counter++;
                }
                console.log('row_readings_count: ', row_readings_counter);
            }

            if (row_readings_counter != users[i].row_readings_count) {
                output += users[i].username + " ID: " + users[i]._id + " was: " + users[i].row_readings_count + " now : " + row_readings_counter + "<br>";
                User.updateOne({ "_id": users[i]._id }, { "row_readings_count": row_readings_counter }, () => { });
            }
        }
        res.send(output);
    })
})

app.post('/get_today_reading', function (req, res) {
    var Today = new Date(Date.now());
    // console.log(req.body.user_id);
    User.findOne({ '_id': req.body.user_id }, function (err, user) {
        if (err)
            console.log(err);
        else {

            //checking for last reading
            var readings_num = user.reading_dates.length;
            var row_readings_count = user.row_readings_count;
            if (readings_num != 0) { // if not first time to read
                var last_reading = new Date(user.reading_dates[readings_num - 1]);

                // if next day increment readings_num and push new date
                if (last_reading.toDateString() != Today.toDateString()) {

                    readings_num++;

                    //checking if it's a reading in a row
                    var today = new Date(Date.now());
                    console.log('today: ', today);
                    var last_reading = new Date(last_reading.toDateString());
                    console.log('last_reading: ', last_reading);

                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

                    var diffDays = Math.floor(Math.abs((last_reading.getTime() - today.getTime()) / (oneDay)));
                    console.log('diffDays: ', diffDays);

                    if (diffDays > 1)
                        row_readings_count = 1;
                    else
                        row_readings_count++;

                    User.updateOne({ '_id': user._id }, { 'row_readings_count': row_readings_count, $push: { "reading_dates": Today } }, (err, u) => { if (err) console.log(err) });

                    //update Reading users counter
                    Reading.updateOne({ "number": readings_num }, { '$inc': { 'users_count': '1' } }, (err) => { if (err) console.log(err) });
                }
            } else { // if first time to read
                row_readings_count = 1;
                readings_num++;
                User.updateOne({ '_id': user._id }, { 'row_readings_count': row_readings_count, $push: { "reading_dates": Today } }, (err, u) => { if (err) console.log(err); console.log(u) });

                //update Reading users counter
                Reading.updateOne({ "number": readings_num }, { '$inc': { 'users_count': '1' } }, (err) => { if (err) console.log(err) });
            }



            CheckTrophies(user, "reading_row", function (err, user, newTrophy1, LevelChanged1) {
                CheckTrophies(user, "reading_days", function (err, user, newTrophy2, LevelChanged2) {
                    Reading.findOne({
                        "number": readings_num
                    }, function (err, reading) {
                        if (err) {
                            return res.status(400);
                        } else {
                            out = {};
                            if (newTrophy1 != null) //row trophy is more important
                                out.newTrophy = newTrophy1;
                            else if (newTrophy2 != null)
                                out.newTrophy = newTrophy2;

                            if (LevelChanged1 || LevelChanged2)
                                out.LevelChanged = true;

                            if (reading)
                                out.reading = reading;

                            res.send(out);

                            // if(newTrophy2 != null && (LevelChanged1||LevelChanged2)){
                            //     return res.status(206).send({reading,newTrophy:newTrophy2,LevelChanged:true});
                            // }
                            // if(newTrophy2 != null){
                            //     return res.status(205).send({reading,newTrophy:newTrophy2});
                            // }
                            // if (reading) {
                            //     return res.send(reading);
                            // }
                        }
                    });
                })
            })

        }
    })
});


app.post('/check_answer', function (req, res) {
    console.log(req.body);
    User.findOne({ "_id": req.body.user_id }, function (err, user) {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            //checking if question is answered before
            for (var i = 0; i < user.answered_questions.length; i++) {
                if (user.answered_questions[i].question_id == req.body.question_id) {
                    console.log("Already answered this question before !");
                    return res.status(201).send("Already answered this question before !");
                }
            }
            //if not answered before.. check for answer and add it in the answered quesions
            Reading.findOne({ "_id": req.body.reading_id }, function (err, reading) {
                console.log('reading: ', reading);
                if (err) {
                    console.log("error");
                    return res.send(err);
                } else {
                    for (var j = 0; j < reading.questions.length; j++) {
                        // console.log(req.body.question_id);
                        // console.log(reading.questions[j].score);
                        if (req.body.question_id == reading.questions[j].id) {
                            //if correct answer
                            if (reading.questions[j].answer == req.body.choice) {
                                //update question counters in reading model (inc answers counter and correct answer counter)
                                Reading.updateOne({ 'questions._id': req.body.question_id }, {
                                    '$inc': {
                                        'questions.$.answers_count': '1',
                                        'questions.$.correct_answers_count': '1'
                                    }
                                }, () => { });

                                var question = {
                                    question_id: req.body.question_id,
                                    reading_id: req.body.reading_id,
                                    user_answer: req.body.choice,
                                    is_right_answer: true,
                                    date: Date.now()
                                }
                                var question_score = reading.questions[j].score;

                                //adding points
                                AddPoints(user, question_score, function (err, user, LevelChanged1) {
                                    User.updateOne({ "_id": req.body.user_id }, {
                                        row_correct_answer_count: user.row_correct_answer_count + 1,
                                        $push: { "answered_questions": question }
                                    }, function (err, user_updated) {
                                        CheckTrophies(user, "correct_answers_row", function (err, user, newTrophy, LevelChanged2) {
                                            if (newTrophy != null && (LevelChanged1 || LevelChanged2)) {
                                                return res.status(207).send({ question_score: question_score, newTrophy, LevelChanged: true })
                                            }
                                            if (LevelChanged1 || LevelChanged2) {
                                                return res.status(204).send({ question_score: question_score, LevelChanged: true });
                                            } if (newTrophy != null) {
                                                return res.status(207).send({ question_score: question_score, newTrophy })
                                            } else {
                                                return res.status(202).send({ question_score: question_score });
                                            }
                                        })
                                    })
                                });

                            } else {// if wrong answer
                                //update question counter in reading model (inc answers counter)
                                Reading.updateOne({ 'questions._id': req.body.question_id }, {
                                    '$inc': {
                                        'questions.$.answers_count': '1'
                                    }
                                }, () => { });

                                //pushing that the answer was wrong
                                var question = {
                                    question_id: req.body.question_id,
                                    reading_id: req.body.reading_id,
                                    user_answer: req.body.choice,
                                    is_right_answer: false,
                                    date: Date.now()
                                    // right_answer: reading.questions[j].answer,
                                    // question: reading.questions[j].question,
                                    // choices: reading.questions[j].choices,
                                    // score: reading.questions[j].score,
                                }
                                User.updateOne({ "_id": req.body.user_id }, {
                                    row_correct_answer_count: 0,
                                    $push: { "answered_questions": question }
                                }, function (err) {
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

app.post('/get_user_history', function(req, res) {
    var user;
    User.findById(req.body._id, {
        reading_dates: 1,
        answered_questions: 1
    })
    .then(function(user_doc) {
        user = user_doc;
        //get all the readings that the user has finished using readings_dates
        return Reading.find({number: {$lte: user.reading_dates.length}}, {
            questions: 1
        })
    })
    .then(function(readings) {
        var answered_questions = [];    //that will be returned to user
        //for each answered question:
        for (var i=0; i<user.answered_questions.length; ++i) {
            var question = user.answered_questions[i];
            //find the reading that contains this question
            for (var j=0; j<readings.length; ++j) {
                var reading = readings[j];
                if (question.reading_id.equals(reading._id)) {  //can't compare ObjectID using ==
                    //find the question inside this reading
                    for (var k=0; k<reading.questions.length; ++k) {
                        if (question.question_id.equals(reading.questions[k]._id)) {
                            answered_questions.push({
                                question:               reading.questions[k].question,
                                choices:                reading.questions[k].choices,
                                score:                  reading.questions[k].score,
                                right_answer:           reading.questions[k].answer,
                                user_answer:            question.user_answer,
                                is_right_answer:        question.is_right_answer,
                                date:                   question.date
                            });
                            break;  //we have found the question
                        }
                    }
                    break;  //we have found the reading
                }
            }
        }
        return res.send(answered_questions);
    })
    .catch(function(err) {
        console.log(err);
        return res.sendStatus(500);
    })
})

//todo: not used function
function get_user_date(id) {
    User.findOne({ 'id': id }, function (err, user) {
        if (err)
            console.log(err);
        else
            return user;
    })
}


app.post('/get_top_5_in_class', function (req, res) {
    User.find({ "class": req.body.class, $or: [{ "admin": { $lt: "5" } }, { 'admin': 6 }] }).sort({ "total_score": -1 }).limit(5).select('name _id level total_score').exec(function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.send(users);
        }
    })
});

app.post('/get_top_5', function (req, res) {
    User.find({ "admin": { $lt: "5" } }).sort({ "total_score": -1 }).limit(5).select('name _id level total_score class').exec(function (err, users) {
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


app.post('/delete_user', function (req, res) {
    User.findById(req.body.id).remove().exec(function (err, status) {
        if (err) {
            res.send(err);
        } else {
            res.send(status);
        }
    })
})

app.post('/update_user', function (req, res) {
    User.update({ "_id": req.body.id }, { "name": req.body.name, "username": req.body.username, "password": req.body.password }).exec(function (err, status) {
        if (err) {
            res.send(err);
        } else {
            res.send(status);
        }
    })
})

app.post('/get_class_users', function (req, res) {
    /*
    examples:
        /get_class_users                    -> get all properties
        /get_class_users?username&password  -> get only 'username' and 'password' properties
    */
    let selection = Object.keys(req.query).join(' ');
    User.find({ "class": req.body.class, "admin": { $lt: "5" } })
        .sort({ "name": 1 })
        .select(selection)
        .exec(function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.send(users);
        }
    })
})

app.get('/get_trophies', function (req, res) {
    Trophy.find().sort({ type: 1, value: 1 }).exec((err, trophies) => { return res.send(trophies) })
})

app.get('/get_gifts', function (req, res) {
    Gift.find({}).sort('level').exec((err, gifts) => { return res.send(gifts) })
})

app.get('/get_all_users', function (req, res) {
    User.find((err, users) => res.send(users));
})

app.get('/get_levels', function (req, res) {
    Level.find().sort('number').exec((err, levels) => res.send(levels));
})

app.get('/get_reading_dates', function (req, res) {
    User.find({ "admin": 0 }).select("reading_dates").exec((err, reading_dates) => res.send(reading_dates));
})


app.get('/get_classes_and_scores',function(req,res){
    User.find({ "admin": 0 , "total_score": {$ne: 0}}).select("total_score class -_id").exec((err, users) => res.send(users));
})

app.post('/select_gift',function(req,res){
    User.updateOne({"_id":req.body.user_id},{"gift":req.body.gift_id}).exec(function(err){
        if(err){
            console.log(err);
        }else{
            User.findOne({"_id":req.body.user_id}).populate("trophies.trophy").populate("gift").exec(function(err,user){
                res.send(user);
            })
        }
    })
})

app.get('/get_all_users_gifts',function(req,res){
    User.find({'admin':0}).populate("gift").select("gift -_id").exec(function(err,users){
        if(err){
            console.log(err);
        }else{
            res.send(users);
        }
    })
})

app.get('/get_all_scores',function(req,res){
    User.find({'admin':0, "total_score": {$ne: 0}}).select("total_score -_id").exec(function(err,users){
        if(err){
            console.log(err);
        }else{
            res.send(users);
        }
    })
})


var Event = require("./Models/Event");

app.post('/add_event_for_user', function (req, res) {

    AddPoints(req.body.user, req.body.points, function (err, user, LevelChanged) {
        var event = new Event();
        event.user= user._id;
        event.type= req.body.type;
        event.date= new Date();
        event.points= req.body.points;
        event.save(function (err, event) {
        if (err)
            res.send(err);
        else {
            res.send("done");
        }
    })
    })

});

app.post('/check_if_user_has_event', function (req, res) {

    Event.findOne({"type":req.body.type,"user":req.body.user_id},function(err,event){
        if(err)
            console.log(err);
        else
            if(event)
                res.send(true);
            else
                res.send(false);    

    })

});

var routes_bible = require('./routes-bible');
app.use(routes_bible);

var routes_readings = require('./routes-readings');
app.use(routes_readings);
