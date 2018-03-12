/*
    Note: create unique index on 'name'
    db.readings_plans.createIndex({name: 1}, {unique: 1})
*/

const mongoose = require('mongoose');

let readings_plan_schema = mongoose.Schema({
    name: String,
    readings: [{
        book: { type: String, lowercase: true },
        chapter: Number,
        verse_start: Number,
        verse_end: Number,
    }]
}, {collection: 'readings_plans'});

module.exports = mongoose.model('ReadingsPlan', readings_plan_schema);
