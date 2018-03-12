(function(){
    'use strict';
    
    angular.module('readings')
    .controller('readingsListController', ReadingsListController);
    
    ReadingsListController.$inject = ['dataService'];
    function ReadingsListController(dataService){
        //remember: variable name can be anything other than $ctrl
        var $ctrl = this;
        
        $ctrl.edit = function(_id){
            dataService.goToReadingEdit(_id);
        };

        $ctrl.view = function(_id){
            dataService.goToReadingView(_id);
        };

        $ctrl.canEdit = function(reading_number){
            return dataService.canEditReading(reading_number);
        }
    }
})();