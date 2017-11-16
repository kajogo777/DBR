(function(){
    'use strict';
    
    angular.module('readings')
    .controller('readingEditController', ReadingEditController);

    ReadingEditController.$inject = ['dataService', '$state'];
    function ReadingEditController(dataService, $state){
        var $ctrl = this;

        //Note (FOR questions components):
        //although it's against the components desgin way
        //to change the bound objects or arrays inside the component
        //because these changes affect the passed object/array (because
        //it's a reference), this will be ignored here, each
        //question component will handle the question object by itself
        //and for any required function calls to the parent, such as
        //delete question, which needs to be in the 'reading' context,
        //not in the 'questionMcq' context for example, the question
        //component may simply ask the injected service 'dataService',
        //or don't let the question handles deleting (or anything outside
        //its context), but rather let the parent handle this, i.e. put
        //the delete button on the readingEdit template

        //feature: confirm before deleting a question
        //feature: fix page scroll on question re-order, OR:
        //feature: add better question re-ordering functionality

        $ctrl.new_question_type = 'mcq';
        $ctrl.questionAdd = function(){
            //check if a question type is selected
            if($ctrl.new_question_type !== ''){
                $ctrl.reading.questionAdd($ctrl.new_question_type);
                //don't reset the selected question type for convenience
                // $ctrl.new_question_type = '';
            }
        }

        //false when:
        //- currently saving, to disable
        //  the save button, and further save requests,
        //- and after saving successfully,
        //- todo and when inputs are still invalid
        $ctrl.can_save = true;

        //message displayed when saving
        $ctrl.save_msg = '';
        $ctrl.show_save_msg = false;
        
        $ctrl.save = function(){
            //push the reading to the server to save changes

            $ctrl.can_save = false;

            //reset possible previous error message
            $ctrl.show_save_msg = true;
            $ctrl.save_msg = 'Saving... please wait.';

            //first check if we're editing an existing reading
            //or adding a new one
            if($ctrl.reading.hasOwnProperty('_id')){
                //there is an _id key, it's an edit to existing reading
                var promise = dataService.editReading($ctrl.reading);
                promise.then(function(){
                    //reading update success
                    $state.go('readingManager');
                }, function(){
                    //reading update fail
                    $ctrl.save_msg = 'Failed to update reading, please try again';
                    $ctrl.can_save = true;
                })
            }else{
                //...else, it's: add new reading
                var promise = dataService.addReading($ctrl.reading);
                promise.then(function(){
                    //reading add success
                    $state.go('readingManager');
                }, function(){
                    //reading add fail
                    $ctrl.save_msg = 'Failed to add reading, please try again';
                    $ctrl.can_save = true;
                })
            }
        };

        $ctrl.discard = function(){
            //temporary way to confirm
            //feature: use modal dialog in the future
            //feature: check if inputs where $touched
            //feature: handle browser back button, currently
            //it is silent with no warnings
            var result = window.confirm('Are you sure you want to discard?');
            if(result){
                $state.go('readingManager');
            }
        };

    }
    
})();