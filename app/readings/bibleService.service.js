(function() {
    'use strict';
    angular.module('readings')
    .service('bibleService', BibleService);
    BibleService.$inject = ['dataService', '$q', '$http'];
    function BibleService(dataService, $q, $http) {
        var service = this;

        service.getBooksNames = function(callback) {
            /* callback(err, readings) */
            $http.get( dataService.getBaseUrl() + '/bible/get_books_names' )
            .then(resolve, reject)
            function resolve(res) {
                callback(null, res.data);
            }
            function reject(res) {
                callback(res.data, undefined);
            }
        }

        service.getBibleChapter = function(options) {
            /*
                Returns a promise (angular's $q)
                    Promise.resolve(chapter)
                    Promise.reject(err)

                notes: using $q instead of native Promises because
                native Promises didn't update the view automatically
            */
            var url = dataService.getBaseUrl();
            url += '/bible?' + 'book=' + options.book + '&chapter=' + options.chapter;
            url += options.verse_start !== undefined ? '&verse_start=' + options.verse_start : '';
            url += options.verse_end !== undefined ? '&verse_end=' + options.verse_end : '';
            url += options.diacritics !== undefined ? '&diacritics=' + options.diacritics : '';
            url += options.number_verses !== undefined ? '&number_verses=' + options.number_verses : '';
            return $q(function(resolve, reject) {
                $http.get(url)
                .then(function(res) {
                    resolve(res.data);
                }, function(res) {
                    reject(res.data);
                })
            })
        }
        
        service.getVersesNumber = function(book, chapter) {
            /*
                Returns a promise (angular's $q)
                    Promise.resolve(num_verses)
                    Promise.reject(err)
                
                notes: using $q instead of native Promises because
                native Promises didn't update the view automatically
            */
            return $q(function(resolve, reject) {
                service.getBibleChapter({
                    book: book,
                    chapter: chapter,
                    diacritics: 0,          //to significantly reduce the size of response
                    number_verses: false,
                })
                .then(function(chapter) {
                    resolve(chapter.verses.length);
                }, function(err) {
                    reject(err);
                })
            })
        }

    }
})();