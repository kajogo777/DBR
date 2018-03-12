const mongoose = require('mongoose');
const Chapter = require('./Models/Bible');

function getBibleChapter(options, callback) {
    /*
        options = {
            book:           string
            chapter:        number
            verse_start:    number      (optional, default == 1)
            verse_end:      number      (optional, default == last verse in chapter)
            diacritics:     0 | 1 | 2   (optional, default == 2)
            number_verses:  boolean     (optional, default == true)
        }
        callback(err, result)
            on error:       result === undefined
            if found:       result == mongoose's Bible schema (but without _id)
            if not found:   result === null
        
        No checks on validity of options are performed, this is the
        responsibility of the caller,
        so try-catch is used to avoid errors like
        calling `toLowerCase()` on undefined `options.book`
    */
    try {
        Chapter.findOne({book_name_en: options.book.toLowerCase(), chapter: options.chapter},
            {_id: 0}, 
            function(err, doc) {
            if (err) {
                //db error
                callback(err);
            }
            else if (doc === null) {
                //requested chapter was not found in db
                callback(null, null)
            } else {
                //requested chapter was found successfully.
                //note: numbering must happen before splicing
                if (options.number_verses !== false) {
                    doc.numberVerses();
                }
                //note: splicing must happen from the end first
                if (options.verse_end !== undefined) {
                    doc.verses.splice(options.verse_end);
                }
                if (options.verse_start !== undefined) {
                    doc.verses.splice(0, options.verse_start-1);
                }
                if (options.diacritics == 0) {
                    //remove all diacritics
                    doc.removeDiacritics(true);
                } else if(options.diacritics == 1) {
                    //remove most diacritics
                    doc.removeDiacritics(false);
                }
                callback(null, doc);
            }
        })
    }
    catch(err) {
        callback(err);
    }
}

module.exports = function() {
    this.getBibleChapter = getBibleChapter;
}
