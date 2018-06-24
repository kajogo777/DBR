(function() {
    'use strict';
    angular.module('readings')
    .service('bibleService', BibleService);
    BibleService.$inject = ['dataService', '$http', '$q'];
    function BibleService(dataService, $http, $q) {
        var service = this;

        /*
            notes:
            
            - using $q instead of native Promises because
            native Promises didn't update the view automatically

            - for functions that correspond to backend server API
            functions, consult the API for info about parameters
            and return values, this is to keep documentation
            in a single place
            
        */

        service.getBooksNames = function(callback) {
            /*
                callback(err, readings)
            */
            $http.get( dataService.getBaseUrl() + '/bible/get_books_names' )
            .then(resolve, reject)
            function resolve(res) {
                callback(null, res.data);
            }
            function reject(res) {
                callback(res.data, undefined);
            }
        }

        var book_metadata = {};
        service.getBookMetadata = function(book) {
            /*
                Returns a promise (angular's $q)
                    Promise.resolve(book_metadata)
                    Promise.reject(err)
                
                caches the metadata on first request for a given book,
                and uses the cache for further requests of the same book,
                 without making any network requests
            */
            if (book_metadata[book]) {
                return $q.resolve(book_metadata[book]);
            }
            return $q(function(resolve, reject) {
                $http({
                    method: 'GET',
                    url: dataService.getBaseUrl() + '/bible/get_book_metadata',
                    params: {book: book}
                })
                .then(function(res) {
                    //cache the metadata of this book
                    book_metadata[book] = res.data;
                    resolve(res.data);
                })
                .catch(function(res) {
                    reject(res.data);
                })
            });
        }
        
        service.getChaptersNumber = function(book) {
            /*
                Returns a promise (angular's $q)
                    Promise.resolve(num_chapters)
                    Promise.reject(err)
            */
            return $q(function(resolve, reject) {
                service.getBookMetadata(book)
                .then(function(book_metadata) {
                    var num_chapters = book_metadata.num_verses_of_chapter.length;
                    resolve(num_chapters);
                })
                .catch(function(err) {
                    reject(err);
                })
            });
        }

        service.getVersesNumber = function(book, chapter) {
            /*
                Returns a promise (angular's $q)
                    Promise.resolve(num_verses)
                    Promise.reject(err)
            */
            return $q(function(resolve, reject) {
                service.getBookMetadata(book)
                .then(function(book_metadata) {
                    //remember that the array of number of verses starts from zero,
                    //i.e chapter 1 is at index 0
                    var num_verses = book_metadata.num_verses_of_chapter[chapter-1];
                    resolve(num_verses);
                })
                .catch(function(err) {
                    reject(err);
                })
            });
        }

        service.validateShahed = function(book, chapter, verse_start, verse_end) {
            /*
                checks a shahed if it's correct,
                shahed is given by:
                    book:       string - should be the same as returned by getBooksNames()
                    chapter:                number
                    verse_start:            number
                    verse_end (optional):   number

                Returns a promise (Angular's $q)
                    resolve() if shahed is correct
                    reject(err)
            */
            return $q(function(resolve, reject) {
                if (! (book && chapter && verse_start)) {   //verse_end is optional
                    reject('Shahed is missing one or more parameters');
                }
                if (chapter < 1 || verse_start < 1 || (verse_end && verse_end < 1)) {
                    reject('Shahed has negative numbers')
                }
                if(verse_end && verse_start > verse_end) {
                    reject('Start is greater than end')
                }
                service.getChaptersNumber(book)
                .then(function(num_chapters) {
                    if (chapter > num_chapters) {
                        reject('Invalid chapter: (' + book + ') has '
                            + num_chapters + ' chapters only');
                    }
                })
                .then(function() {
                    return service.getVersesNumber(book, chapter);
                })
                .then(function(num_verses) {
                    if(verse_start > num_verses) {
                        reject('Invalid start, chapter ' + chapter +
                            ' has ' + num_verses + ' verses only');
                    }
                    if(verse_end && verse_end > num_verses) {
                        reject('Invalid end, chapter ' + chapter +
                            ' has ' + num_verses + ' verses only');
                    }
                    resolve();
                })
                .catch(function(err) {
                    reject(err);
                })
            });
        }

        service.getBibleChapter = function(options) {
            /*
                Returns a promise (angular's $q)
                    Promise.resolve(chapter)
                    Promise.reject(err)
            */
            //todo: needs testing
            return $q(function(resolve, reject) {
                $http({
                    method: 'GET',
                    url: dataService.getBaseUrl() + '/bible',
                    params: {
                        book:           options.book,
                        chapter:        options.chapter,
                        verse_start:    options.verse_start !== undefined ? options.verse_start : '',
                        verse_end:      options.verse_end !== undefined ? options.verse_end : '',
                        diacritics:     options.diacritics !== undefined ? options.diacritics : '',
                        number_verses:  options.number_verses !== undefined ? options.number_verses : ''
                    }
                })
                .then(function(res) {
                    resolve(res.data);
                }, function(res) {
                    reject(res.data);
                })
            })
        }

        service.getShahedString = function(book_abbr, chapter, verse_start, verse_end, add_parentheses = false) {
            var shahed = book_abbr + ' ' + chapter + ': ' + verse_start + '-' + verse_end;
            return add_parentheses ? '(' + shahed + ')' : shahed;
        }
    }
})();