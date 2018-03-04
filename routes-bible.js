const express = require('express');
const router = express.Router();
const Chapter = require('./Models/Bible');

router.get('/bible', bibleController);

function bibleController(req, res) {
    /*
        Example get requests:
        /bible?book=genesis&chapter=1               -> keep diacritics
        /bible?book=genesis&chapter=1&diacritics=0  -> removes all diacritics
        /bible?book=genesis&chapter=1&diacritics=1  -> removes most diacritics
    */
    let book_name_en = req.query.book;
    let chapter = req.query.chapter;
    let diacritics = req.query.diacritics;
    //check for missing query params
    if(book_name_en === undefined) {
        let error = {error: 'request missing book name'};
        res.status(400).send(error);
        return;
    }
    if(chapter === undefined) {
        let error = {error: 'request missing chapter number'};
        res.status(400).send(error);
        return;
    }
    book_name_en = book_name_en.toLowerCase();
    //try to retrieve from db
    Chapter.findOne({book_name_en: book_name_en, chapter: chapter}, {_id: 0}, 
        function(err, doc) {
        if (err) {
            //db error
            let error = {error: 'Internal server error. Error retrieving the requested chapter.'};
            res.status(500).send(error);
        }
        else if (doc === null) {
            //request was not found in db
            let error = {error: 'Chapter (' + chapter + ') in book (' + book_name_en + ') was not found.'};
            res.status(404).send(error);
        } else {
            //found successfully
            if (diacritics == '0') {
                res.status(200).send(doc.removeDiacritics(true));
            } else if(diacritics == '1') {
                res.status(200).send(doc.removeDiacritics(false));
            } else {
                res.status(200).send(doc);
            }
        }
    })
}

module.exports = router;
