/*
	note: don't forget to manually create a unique
    compound index on book_name_en + chapter,
    db.collection.createIndex( {book_name_en: 1, chapter: 1}, {unique: 1})
*/

const mongoose = require('mongoose');

let chapterSchema = mongoose.Schema({
    book_name: String,                              //arabic name
    book_name_en: { type: String, lowercase: true}, //english name for API urls
    book_name_short: String,                        //abbreviated arabic name
    chapter: Number,
    verses: [String]
}, {versionKey: false, collection: 'bible'});

chapterSchema.methods.removeDiacritics = function(removeAll = false) {
    //this method is taken from st-takla.org, this is
    //the method they use to remove diacritics dynamically
    //when you click the link that removes them,
    //set removeAll = false to keep certain diacritics,
    //note the diacritics in the regular expressions below
    for (let i=0; i<this.verses.length; ++i) {
        this.verses[i] = this.verses[i]
        .replace(/َ/g, '').replace(/ِ/g, '').replace(/ُ/g, '')
        .replace(/ْ/g, '').replace(/ّ/g, '')
    }
    if (removeAll) {
        for (let i=0; i<this.verses.length; ++i) {
            this.verses[i] = this.verses[i]
            .replace(/ً/g, '').replace(/ٍ/g, '').replace(/ٌ/g, '')
        }
    }
    return this;
}

chapterSchema.methods.numberVerses = function() {
    for (let i=0; i<this.verses.length; ++i) {
        this.verses[i] = (i+1) + ' ' + this.verses[i];
    }
}

module.exports = mongoose.model('Chapter', chapterSchema);
