(function(){
    'use strict';
    
    angular.module('readings')
    .component('questionMcq', {
        templateUrl: 'readings/questionMcq/questionMcq.template.html',
        controller: 'questionMcqController',
        bindings:{
            edit: '<',
            question: '<',
            index: '@'
        }
    });
	
})();