(function(){
    'use strict';
    
    angular.module('readings')
    .component('readingEdit', {
        templateUrl: 'readings/readingEdit/readingEdit.template.html',
        controller: 'readingEditController',
        bindings: {
            reading: '<', //a reference to reading object
            title: '@'
        }
    });
    
})();