(function() {
    'use strict';
    angular.module('readings')
    .component('readingsPlanner', {
        templateUrl: 'readings/readingsPlanner/readingsPlanner.template.html',
        controller: 'readingsPlannerController',
        bindings: {
            //none so far
        }
    })
    .controller('readingsPlannerController', ReadingsPlannerController);
    ReadingsPlannerController.$inject = ['dataService', 'bibleService', '$http', 'toastr'];
    function ReadingsPlannerController(dataService, bibleService, $http, toastr) {
        var $ctrl = this;
        //todo: get the max reading number or the first available reading number
        //from db
        $ctrl.start_reading_number = 78;
        $ctrl.insert_position = 0;
        $ctrl.insert_position_inc = true;
        $ctrl.plans = [];
        $ctrl.selected_plan = '';   //only as a binding to the select box
        $ctrl.current_plan = '';    //the actual plan that is loaded
        $ctrl.readings = [];        //gets the value of plan.readings
        var ReadingsPlan = function(name) {
            this.name = name;
            this.readings = [];     //array of Reading
            return this;
        }
        var Reading = function(){
            this.book = '';
            this.chapter;
            this.verse_start;
            this.verse_end;
            return this;
        }
        $ctrl.new_reading = new Reading();
        $ctrl.new_plan = '';

        $ctrl.$onInit = function() {
            $ctrl.getPlansNames(function(err, names) {
                if (!err) {
                    $ctrl.plans = names;
                }
            })
            bibleService.getBooksNames(function(err, books) {
                if (!err) {
                    //capitalize book names
                    for(var i=0; i<books.length; ++i) {
                        books[i] = books[i][0].toUpperCase() + books[i].slice(1);
                    }
                    $ctrl.books = books;
                }
            })
        }

        $ctrl.getPlansNames = function(callback) {
            /* callback(err, names) */
            $http.get( dataService.getBaseUrl() + '/get_readings_plans')
            .then(function(res) {
                callback(null, res.data);
            }, function(res){
                callback(res.data, undefined);
            });
        }

        $ctrl.getPlan = function(name, callback) {
            /* callback(err) */
            var baseUrl = dataService.getBaseUrl();
            var promise = $http.post(baseUrl+'/get_readings_plan', {name: name});
            promise.then(successCallback, failCallback);
            function successCallback(res) {
                //capitalize book names,
                //no need to change back to lowercase on saving,
                //mongoose will handle this on the server side
                var plan = res.data;
                var readings = plan.readings;
                for(var i=0; i<readings.length; ++i) {
                    readings[i].book = readings[i].book[0].toUpperCase() + readings[i].book.slice(1);
                }
                $ctrl.readings = readings;
                $ctrl.insert_position = readings.length;
                $ctrl.current_plan = $ctrl.selected_plan;
                callback(null);
            }
            function failCallback(res) {
                callback(res.data);
            }
        }

        $ctrl.changePlan = function() {
            if ($ctrl.enableSave) {
                //there are pending changes to the current plan
                //todo: change to modal dialog
                var result = confirm('Changes you made to the current plan will be lost, change plan anyway?');
                if (result) {
                    $ctrl.getPlan($ctrl.selected_plan, function(err) {
                        if (err) {
                            //plan was not changed, revert selection
                            $ctrl.selected_plan = $ctrl.current_plan;
                        } else {
                            //plan was changed, update current plan
                            $ctrl.current_plan = $ctrl.selected_plan;
                            $ctrl.enableSave = false;
                        }
                    })
                } else {
                    $ctrl.selected_plan = $ctrl.current_plan;
                }
            } else {
                //no pending changes to the current plan, plan can be changed
                $ctrl.getPlan($ctrl.selected_plan, function(err) {
                    if (err) {
                        $ctrl.selected_plan = $ctrl.current_plan;
                    } else {
                        $ctrl.current_plan = $ctrl.selected_plan;
                    }
                })
            }
        }

        //disable saving when no changes to save, or
        //while there is a save in progress
        $ctrl.enableSave = false;
        
        $ctrl.savePlan = function() {
            $ctrl.enableSave = false;
            var plan = new ReadingsPlan();
            plan.name = $ctrl.current_plan;
            plan.readings = $ctrl.readings;
            $http.post( dataService.getBaseUrl() + '/save_readings_plan', {plan: plan})
            .then(function(res) {
                toastr.success('Plan saved successfully')
            }, function(res) {
                //saving failed, do nothing
                toastr.error('Error saving plan, try again')
                $ctrl.enableSave = true;
            })
        }

        $ctrl.createPlan = function() {
            //note: although angular automatically trims the ng-model
            //variable, but for the sake of completeness it is done anyway,
            //so it does not depend on angular's behaviour
            var name = $ctrl.new_plan.trim();
            if (name.length == 0) {
                return;
            }
            if ($ctrl.plans.includes(name)) {
                toastr.error('Plan with same name already exits');
                return;
            }
            $http.post(dataService.getBaseUrl() + '/create_readings_plan',
                {name: name})
            .then(function(res) {
                //creation successful
                $ctrl.plans.push(name);
                $ctrl.new_plan = '';
                toastr.success('Plan created');
            }, function(res) {
                //creation failed
                toastr.error(res.data);
            });
        }

        $ctrl.deletePlan = function() {
            //this assumes you can only delete the plan
            //that is currently selected and loaded,
            //plan to delete == $ctrl.selected_plan == $ctrl.current_plan
            //so when it finishes, it deletes all local readings and
            //disables saving any changes that were pending
            if ($ctrl.selected_plan == '') {
                return;
            }
            //todo: change to modal dialog
            if (!confirm('This will delete the plan permanently.' +
                ' This can NOT be undone.\nDelete?')) {
                return;
            }
            $http.post(dataService.getBaseUrl() + '/delete_readings_plan',
                {name: $ctrl.selected_plan})
            .then(function(res) {
                //deletion successful
                toastr.success('Plan deleted successfully');
                var ind = $ctrl.plans.findIndex(function(value) {
                    return value == $ctrl.selected_plan;
                })
                $ctrl.plans.splice(ind, 1);
                $ctrl.selected_plan = '';
                $ctrl.current_plan = '';
                $ctrl.readings = [];
                $ctrl.enableSave = false;
            }, function(res) {
                //deletion failed
                toastr.error(res.data);
            });
        }

        $ctrl.readingAdd = function() {
            if ($ctrl.current_plan !== '' && 
            $ctrl.new_reading.book && $ctrl.new_reading.chapter &&
            $ctrl.new_reading.verse_start && $ctrl.new_reading.verse_end) {
                bibleService.getVersesNumber($ctrl.new_reading.book, $ctrl.new_reading.chapter)
                .then(function(num_verses) {
                    if($ctrl.new_reading.verse_start > $ctrl.new_reading.verse_end) {
                        toastr.error('Start is greater than end')
                        return;
                    }
                    if($ctrl.new_reading.verse_start > num_verses) {
                        toastr.error('Invalid start, chapter ' +
                            $ctrl.new_reading.chapter + ' has ' + num_verses + ' verses only');
                        return;
                    }
                    if($ctrl.new_reading.verse_end > num_verses) {
                        toastr.error('Invalid end, chapter ' +
                            $ctrl.new_reading.chapter + ' has ' + num_verses + ' verses only');
                        return;
                    }
                    $ctrl.readings.splice($ctrl.insert_position, 0, $ctrl.new_reading);
                    var book = $ctrl.new_reading.book;
                    $ctrl.new_reading = new ReadingsPlan();
                    $ctrl.new_reading.book = book;
                    if ($ctrl.insert_position_inc) {
                        $ctrl.insert_position++;
                    }
                    angular.element('#input-chapter').focus();
                    $ctrl.enableSave = true;
                }, function(err) {
                    toastr.error(err);
                })
            }
        }

        $ctrl.readingDelete = function(index) {
            $ctrl.readings.splice(index, 1);
            $ctrl.enableSave = true;
        }

        $ctrl.readingView = function(index) {
            var r = $ctrl.readings[index];
            bibleService.getChapter(r.book, r.chapter, r.verse_start, r.verse_end, 1, true)
            .then(function(chapter){
                //todo: view verses in a modal dialog
            }, function(res) {
                //failed to get chapter, display error
            })
        }

        $ctrl.calculateReadingNumber = function(number) {
            /* calculates the actual reading number */
            return $ctrl.start_reading_number + number;
        }

        $ctrl.isPlanEmpty = function() {
            return $ctrl.readings.length == 0 && $ctrl.current_plan != '';
        }

        $ctrl.deleteReadings = function() {
            //todo: change to modal dialog
            var result = confirm('Are you sure?');
            if (result) {
                $ctrl.readings.splice(0, $ctrl.readings.length);
                $ctrl.insert_position = 0;
                $ctrl.enableSave = true;
            }
        }
        
        //disable generation when a previous one
        //is already in progress
        $ctrl.enableGenerate = true;

        $ctrl.generateReadings = function() {
            if ($ctrl.enableGenerate && $ctrl.readings.length != 0) {
                $ctrl.enableGenerate = false;
                $http.post(dataService.getBaseUrl() + '/generate_readings',
                {
                    readings: $ctrl.readings,
                    start_reading_number: $ctrl.start_reading_number,
                    diacritics: 1,
                    number_verses: true
                })
                .then(function(res) {
                    //generation success
                    //notifiy the Readings Manager to make sure
                    //it re-fetches all readings, and not use
                    //previously fetched readings if they exist
                    dataService.invalidateReadings();
                    toastr.success('Readings generated successfully');
                    $ctrl.enableGenerate = true;
                }, function(res) {
                    //generation fail
                    toastr.error(res.data);
                    $ctrl.enableGenerate = true;
                });
            }
        }
    }
})();