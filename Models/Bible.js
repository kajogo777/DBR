const mongoose = require('mongoose');

let chapterSchema = mongoose.Schema({
    book_name: String,                              //arabic name
    book_name_en: { type: String, lowercase: true}, //english name for API urls
    book_name_short: String,                        //abbreviated arabic name
    chapter: Number,
    verses: [String]
}, {versionKey: false, collection: 'bible'});

chapterSchema.methods.removeDiacritics = function() {
    //this method is taken from st-takla.org, this is
    //the method they use to remove diacritics dynamically
    //when you click the link that removes them,
    //note the diacritics in the regular expressions below
    for (let i=0; i<this.verses.length; ++i) {
        this.verses[i] = this.verses[i]
        .replace(/َ/g, '').replace(/ً/g, '').replace(/ُ/g, '').replace(/ٌ/g, '')
        .replace(/ِ/g, '').replace(/ٍ/g, '').replace(/ْ/g, '').replace(/ّ/g, '')
    }
    return this;
}

module.exports = mongoose.model('Chapter', chapterSchema);
