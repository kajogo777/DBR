(function() {
    'use strict';
    angular.module('readings')
    .service('bibleService', BibleService);
    BibleService.$inject = ['dataService', '$q', '$http'];
    function BibleService(dataService, $q, $http) {

        this.getBooksNames = function(callback) {
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

        //todo: make this function a server request only,
        //put all functionality on server
        
        this.getChapter = function(book, chapter, verse_start, verse_end, diacritics, number_verses) {
            var deferred = $q.defer();
            var url = dataService.getBaseUrl();
            url += '/bible?' + 'book=' + book + '&chapter=' + chapter;
            url += '&diacritics=' + diacritics;
            if (number_verses) {
                url += '&number_verses';
            }
            $http.get(url)
            .then(function(res) {
                var chapter = res.data;
                //splicing must happen from the end first
                if (verse_end !== null) {
                    chapter.verses.splice(verse_end);
                }
                if (verse_start !== null) {
                    chapter.verses.splice(0, verse_start-1);
                }
                chapter.verses = chapter.verses.join('\n');
                chapter.shahed = chapter.book_name_short +
                    ' ' + chapter.chapter + ': ' + verse_start + '-' + verse_end;
                deferred.resolve(res.data);
            }, function(res) {
                deferred.reject(res.data);
            })
            return deferred.promise;
        }
        
        this.getVersesNumber = function(book, chapter) {
            var deferred = $q.defer();
            this.getChapter(book, chapter, null, null, 2, false)
            .then(function(res) {
                deferred.resolve(res.verses.length);
            }, function(res) {
                //failed to get chapter
                deferred.reject(res);
            })
            return deferred.promise;
        }
        
    }
})();