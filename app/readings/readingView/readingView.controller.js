(function(){
    'use strict';
    
    angular.module('readings')
    .controller('readingViewController', ReadingViewController);

    ReadingViewController.$inject = ['dataService'];
    function ReadingViewController(dataService){
        var $ctrl = this;

        //todo remove if not required
    }
    
})();