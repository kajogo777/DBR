(function(){
    'use strict';
    
    angular.module('readings')
    .component('readingManager', {
        templateUrl: 'readings/readingManager/readingManager.template.html',
        controller: 'readingManagerController',
        bindings: {
            readings: '<'
        }
    });
    
})();