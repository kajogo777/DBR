(function(){
    'use strict';
    
    angular.module('readings')
    .component('readingView', {
        templateUrl: 'readings/readingView/readingView.template.html',
        controller: 'readingViewController',
        bindings: {
            reading: '<'
        }
    });
    
})();