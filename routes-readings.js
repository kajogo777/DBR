/*
    routes related to readings, especially but
    not only: the reading manager
*/

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reading = require('./Models/Reading');
const ReadingsPlan = require('./Models/ReadingsPlan');
const Chapter = require('./Models/Bible');
require('./functions-bible')();

router.post('/add_reading', function (req, res) {
    // console.log(req.body);
    var reading = new Reading(req.body.reading);
    reading.save(function (err, reading) {
        if (err)
            res.send(err);
        else {
            res.send("reading added successfully");
        }
    })
});

router.get('/get_reading/:id', function (req, res) {
    Reading.findOne({ '_id': req.params.id }, (err, reading) => { return res.send(reading) })
});

router.get('/get_readings', function (req, res) {
    /*
    examples:
        /get_readings               ->  get all properties
        /get_reading?_id&number     ->  get only '_id 'and 'number' properties
    */
    let selection = Object.keys(req.query).join(' ');
    Reading.find().select(selection).exec((err, readings) => { return res.send(readings) });
});

router.post('/update_reading', function (req, res) {
    var reading = new Reading(req.body.reading);
    Reading.update({ _id: req.body.reading._id }, reading, (err, done) => { return res.send(done) })
});


/* Readings Plans */

router.get('/get_readings_plans', function(req, res) {
    /* get list of names of existings plans */
    ReadingsPlan.aggregate([
        {
            $group:
            {
                _id: null,
                plans: { $addToSet: '$name' }
            }
        }
    ], function(err, docs) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            //check if there are any plans in collection
            if (docs.length != 0) {
                res.status(200).send(docs[0].plans);
            } else {
                res.status(200).send([]);
            }
        }
    })
})

router.post('/get_readings_plan', function(req, res) {
    /* get a plan by name */
    let name = req.body.name;
    if (name === undefined || name === '') {
        res.sendStatus(400);
        return;
    }
    ReadingsPlan.findOne({name: name}).exec(function(err, doc) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        res.status(200).send(doc);
    })
});

router.post('/save_readings_plan', function(req, res) {
    /* overwrites an existing plan */
    let plan = req.body.plan;
    if (plan === undefined || plan.name === undefined || plan.name === '') {
        res.sendStatus(400);
        return;
    }
    ReadingsPlan.update({name: plan.name}, plan, function(err, rawResponse) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    })
});

router.post('/create_readings_plan', function(req, res) {
    let name = req.body.name;
    if (name === undefined || name === '') {
        res.sendStatus(400);
        return;
    }
    //no check if plan with same name already exists,
    //this should be handled by the unique index on the
    //collection
    var plan = new ReadingsPlan();
    plan.name = name;
    plan.save(function(err, plan) {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    })
});

router.post('/delete_readings_plan', function(req, res) {
    let name = req.body.name;
    if (name === undefined || name === '') {
        res.sendStatus(400);
        return;
    }
    ReadingsPlan.findOneAndRemove({name: name}, function(err) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    })
});


router.post('/generate_readings', function(req, res) {
    let plan_readings = req.body.readings;
    let start_reading_number = req.body.start_reading_number;
    let diacritics = req.body.diacritics;
    let number_verses = req.body.number_verses;
    if (plan_readings === undefined || plan_readings.length == 0) {
        res.sendStatus(400);
        return;
    }
    if (start_reading_number === undefined) {
        res.sendStatus(400);
        return;
    }
    Promise.resolve()
    .then(function() {
        //check for existing readings that have same reading numbers
        let readings_numbers = [];
        for(let i=0; i<plan_readings.length; ++i) {
            readings_numbers.push(start_reading_number + i);
        }
        return Reading.find({number: { $in: readings_numbers }}).count().exec()
    })
    .then(function(count) {
        if (count == 1) {
            return Promise.reject({
                code: 400,
                message: count + ' reading number already exists'
            });
        } else if (count > 1)  {
            return Promise.reject({
                code: 400,
                message: count + ' reading numbers already exist'
            });
        } else {
            return Promise.resolve();
        }
    })
    .then(function(){
        //retrieve bible chapters for each reading plan in parallel,
        //one error in retrieving one of the chapters cancels
        //the whole operation.
        //map plan readings to promises of readings
        let readingsPromises = plan_readings.map(function(plan_reading, index) {
            return new Promise(function(resolve, reject) {
                let options = {
                    book: plan_reading.book,
                    chapter: plan_reading.chapter,
                    verse_start: plan_reading.verse_start,
                    verse_end: plan_reading.verse_end,
                    diacritics: diacritics,
                    number_verses: number_verses
                }
                getBibleChapter(options, function(err, chapter) {
                    if (err) {
                        //database error, getting chapter failed
                        reject(err);
                    } else if (chapter === null) {
                        //chapter was not found
                        reject({
                            code: 404,
                            message: 'Chapter (' + options.chapter + ') in book ('
                                + options.book + ') was not found.'
                        });
                    } else {
                        //chapter was found successfully, create reading
                        let reading = new Reading();
                        reading.number = start_reading_number + index;
                        //note: it's assumed that options.verse_start and options.verse_end
                        //match the actual verses that was returned
                        reading.shahed = chapter.book_name_short + ' ' + chapter.chapter +
                        ': ' + options.verse_start + '-' + options.verse_end;
                        reading.content = chapter.verses.join('\n');
                        resolve(reading);
                    }
                })
            })
        })
        return Promise.all(readingsPromises);
    })
    .then(function(readings) {
        //create and insert readings
        return Reading.insertMany(readings);
    })
    .then(function() {
        //all done
        res.sendStatus(200);
        return Promise.resolve();
    })
    .catch(function(err) {
        console.log('generate readings error:', err);
        if (err.code) {
            //one of the following happend:
            //- one or more readings with the same reading number already exist
            //- one of the requested chapters were not found in the database
            res.status(err.code).send(err.message);
        } else {
            //database error, one of the following happened:
            //- finding readings failed
            //- retrieving at least one of the chapters failed
            //- inserting readings failed
            res.sendStatus(500);
        }
    })
});

module.exports = router;
