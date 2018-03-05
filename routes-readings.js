/*
    routes related to readings, especially but
    not only: the reading manager
*/

const express = require('express');
const router = express.Router();
const Reading = require('./Models/Reading');

router.post('/add_reading', function (req, res) {
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

module.exports = router;
