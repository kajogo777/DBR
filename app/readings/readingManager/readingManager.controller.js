(function(){
    'use strict';
    
    angular.module('readings')
    .controller('readingManagerController', ReadingManagerController);
    
    ReadingManagerController.$inject = ['dataService'];
    function ReadingManagerController(dataService){
        var $ctrl = this;

        $ctrl.add = function(){
            dataService.goToReadingAdd();
        };
    }
})();