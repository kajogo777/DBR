const express = require('express');
const router = express.Router();
const Chapter = require('./Models/Bible');
require('./functions-bible')();

router.get('/bible', getBibleChapterRequest);
router.get('/bible/get_books_names', getBooksNamesRequest);

function getBibleChapterRequest(req, res) {
    /*
        Example get requests:

        /bible?book=GENESIS&chapter=1                   -> book is case-insensitive

        /bible?book=genesis&chapter=1                   -> keep diacritics
        /bible?book=genesis&chapter=1&diacritics=0      -> removes all diacritics
        /bible?book=genesis&chapter=1&diacritics=1      -> removes most diacritics

        /bible?book=genesis&chapter=1                   -> do not number the verses (default)
        /bible?book=genesis&chapter=1&number_verses=0   -> do not number the verses
        /bible?book=genesis&chapter=1&number_verses     -> number the verses
        /bible?book=genesis&chapter=1&number_verses=1   -> number the verses
        
        /bible?book=genesis&chapter=1&verse_start=10
                                -> get verses starting from and including verse 10
        /bible?book=genesis&chapter=1&verse_end=20
                                -> get verses up to and including verse 20
        /bible?book=genesis&chapter=1&verse_start=10&verse_end=20
                                -> get verses between verse 10 and 20 (inclusive)
    */
    let book_name_en = req.query.book;
    let chapter = req.query.chapter;
    let verse_start = req.query.verse_start;
    let verse_end = req.query.verse_end;
    let diacritics = req.query.diacritics;
    let number_verses = req.query.number_verses;
    //check for missing or invalid query params
    if(book_name_en === undefined) {
        res.status(400).send('Request missing book name');
        return;
    } else {
        book_name_en = book_name_en.toLowerCase();
    }
    //if chapter is given in query, try to parse it to a number
    if (chapter === undefined) {
        res.status(400).send('Request missing chapter number');
        return;
    } else {
        chapter = parseInt(chapter);
        if (isNaN(chapter)) {
            res.status(400).send('Invalid chapter (' + req.query.chapter + ')');
            return;
        }
    }
    if (verse_start !== undefined) {
        verse_start = parseInt(verse_start);
        if (isNaN(verse_start)) {
            res.status(400).send('Invalid verse_start (' + req.query.verse_start + ')');
            return;
        }
    }
    if (verse_end !== undefined) {
        verse_end = parseInt(verse_end);
        if (isNaN(verse_end)) {
            res.status(400).send('Invalid verse_end (' + req.query.verse_end + ')');
            return;
        }
    }
    diacritics = parseInt(diacritics);
    number_verses = (number_verses === undefined || number_verses === '0') ? false : true;
    //try to retrieve from db
    var options = {
        book: book_name_en,
        chapter: chapter,
        verse_start: verse_start,
        verse_end: verse_end,
        diacritics: diacritics,
        number_verses: number_verses
    }
    getBibleChapter(options, function(err, chapter){
        if (err) {
            //db error
            console.log(err);
            res.sendStatus(500);
        }
        else if (chapter === null) {
            //request was not found in db
            res.status(404).send('Chapter (' + options.chapter +
                ') in book (' + options.book + ') was not found.');
        } else {
            //doc found successfully
            res.status(200).send(chapter);
        }
    });
}

function getBooksNamesRequest(req, res) {
    Chapter.aggregate([
        {
            $group:
            {
                _id: null,
                books: { $addToSet: '$book_name_en' }
            }
        }
    ], function(err, docs) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).send(docs[0].books);
        }
    })
}

module.exports = router;
