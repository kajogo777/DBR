(function(){
    'use strict';
    
    //note: component name must be "normalized" camelCase
    angular.module('readings')
    .component('readingsList', {
        templateUrl: 'readings/readingManager/readingsList/readingsList.template.html',
        controller: 'readingsListController',
        bindings:{
            readings: '<'
        }
    });
    
})();