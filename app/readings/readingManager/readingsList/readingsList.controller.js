(function(){
    'use strict';
    
    angular.module('readings')
    .controller('readingsListController', ReadingsListController);
    
    ReadingsListController.$inject = ['dataService'];
    function ReadingsListController(dataService){
        //remember: variable name can be anything other than $ctrl
        var $ctrl = this;
        
        $ctrl.edit = function(index){
            dataService.goToReadingEdit(index);
        };

        $ctrl.view = function(index){
            dataService.goToReadingView(index);
        };

        $ctrl.canEdit = function(reading_number){
            return dataService.canEditReading(reading_number);
        }
    }
})();