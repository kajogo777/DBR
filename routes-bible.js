const express = require('express');
const router = express.Router();
const Chapter = require('./Models/Bible');
require('./functions-bible')();

router.get('/bible', getBibleChapterRequest);
router.get('/bible/get_books_names', getBooksNamesRequest);

function getBibleChapterRequest(req, res) {
    /*
        Example get requests:
        /bible?book=genesis&chapter=1               -> keep diacritics
        /bible?book=genesis&chapter=1&diacritics=0  -> removes all diacritics
        /bible?book=genesis&chapter=1&diacritics=1  -> removes most diacritics
        /bible?book=genesis&chapter=1&number_verses -> number the verses
    */
    let book_name_en = req.query.book;
    let chapter = req.query.chapter;
    let diacritics = req.query.diacritics;
    let number_verses = req.query.number_verses;
    //check for missing query params
    if(book_name_en === undefined) {
        res.status(400).send('Request missing book name');
        return;
    }
    if(chapter === undefined) {
        res.status(400).send('Request missing chapter number');
        return;
    }
    book_name_en = book_name_en.toLowerCase();  //also forced by mongoose's schema
    //try to retrieve from db
    var options = {
        book: book_name_en,
        chapter: chapter,
        diacritics: parseInt(diacritics),
        number_verses: number_verses
    }
    getBibleChapter(options, function(err, chapter){
        if (err) {
            //db error
            res.sendStatus(500);
        }
        else if (chapter === null) {
            //request was not found in db
            res.status(404).send('Chapter (' + chapter + ') in book (' + book_name_en + ') was not found.');
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
