(function(){
    'use strict';
    
    //note: component name must be "normalized" camelCase
    angular.module('readings')
    .component('readingsList', {
        templateUrl: 'readings/readingsList/readingsList.template.html',
        controller: 'readingsListController',
        bindings:{
            readings: '<'
        }
    });
    
})();