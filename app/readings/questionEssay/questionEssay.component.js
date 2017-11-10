(function(){
    'use strict';
    
    angular.module('readings')
    .component('questionEssay', {
        templateUrl: 'readings/questionEssay/questionEssay.template.html',
        controller: 'questionEssayController',
        bindings:{
            edit: '<',
            question: '<'
        }
    });
	
})();