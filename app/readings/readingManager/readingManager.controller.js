(function(){
    'use strict';
    
    angular.module('readings')
    .controller('readingManagerController', ReadingManagerController);
    
    ReadingManagerController.$inject = ['dataService', 'orderByFilter'];
    function ReadingManagerController(dataService, orderBy){
        var $ctrl = this;

        $ctrl.add = function(){
            dataService.goToReadingAdd();
        };

        var orderByPropertyName = 'number';
        var orderByIsReverse = true;
        var orderByCustomComp = function(v1, v2){
            //Custom Comparator
            var n1 = parseInt(v1.value, 10);
            var n2 = parseInt(v2.value, 10);
            //if both are strings, compare as strings
            //note: this won't work with values starting
            //with a valid number, even if there is text
            //after it.
            //if only one is string, make sure it goes
            //to the bottom, i.e. its larger than any
            //number
            if(isNaN(n1) && isNaN(n2)){
                return (v1.value < v2.value) ? -1 : 1;
            }else if(isNaN(n1)){
                return 1;
            }else if(isNaN(n2)){
                return -1;
            }
            return (n1 < n2) ? -1 : 1;
        }
        
        $ctrl.filterReadingsPerPage = 10;
        $ctrl.filterCurrentPage = 0;
        $ctrl.filterNumReadings = null; //cannot be calculated before $init
        $ctrl.filterNumPages = null;

        $ctrl.$onInit = function(){
            $ctrl.filterNumReadings = $ctrl.readings.length;
            $ctrl.filterNumPages = Math.ceil($ctrl.filterNumReadings/$ctrl.filterReadingsPerPage);
            $ctrl.sortedReadings = orderBy($ctrl.readings, 'number', true, orderByCustomComp);
            $ctrl.sort();
        }

        $ctrl.sort = function(){
            var sliceStart = $ctrl.filterCurrentPage * $ctrl.filterReadingsPerPage;
            var sliceEnd = sliceStart + $ctrl.filterReadingsPerPage;
            $ctrl.filteredReadings = orderBy($ctrl.sortedReadings.slice(sliceStart, sliceEnd),
                orderByPropertyName, orderByIsReverse, orderByCustomComp);
        }

        $ctrl.filterGetPagesList = function(){
            var list = [];
            var extra = 0;
            for(var i=$ctrl.filterCurrentPage-5; i<$ctrl.filterCurrentPage+5+extra; i++){
                if(i<0){
                    extra++;
                    continue;
                }else if(i<$ctrl.filterNumPages){
                    list.push(i);
                }
            }
            return list;
        }

        $ctrl.filterGoToPage = function(page_num){
            $ctrl.filterCurrentPage = page_num;
            $ctrl.sort();
        }

        $ctrl.filterGetNumReadings = function(){
            //get number of readings in current page
            //e.g. last page may contain a number of
            //readings less than the set number of
            //readings per page
            return $ctrl.filteredReadings.length;
        }
    }
})();