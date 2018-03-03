const express = require('express');
const router = express.Router();
const Chapter = require('./Models/Bible');

router.get('/bible', bibleController);

function bibleController(req, res) {
    /*
        Example get requests:
        /bible?book=genesis&chapter=1
        /bible?book=genesis&chapter=1&diacritics=0
    */
    let book_name_en = req.query.book.toLowerCase();
    let chapter = req.query.chapter;
    let diacritics = req.query.diacritics;
    //check for missing query params
    if(book_name_en === undefined) {
        res.status(400).send('missing book name');
        return;
    }
    if(chapter === undefined) {
        res.status(400).send('missing chapter number');
        return;
    }
    //try to retrieve from db
    Chapter.findOne({book_name_en: book_name_en, chapter: chapter}, {_id: 0}, 
        function(err, doc) {
        if (err) {
            //db error
            res.status(500).send('Error retrieving the requested chapter');
        }
        else if (doc === null) {
            //request was not found in db
            res.status(404).send('Chapter (' + chapter + ') in book (' + book_name_en + ') was not found.');
        } else {
            //found successfully
            if (diacritics == '0') {
                res.status(200).send(doc.removeDiacritics());
            } else {
                res.status(200).send(doc);
            }
        }
    })
}

module.exports = router;
