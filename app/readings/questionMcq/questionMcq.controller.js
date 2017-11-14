(function(){
    'use strict';
    
    angular.module('readings')
    .controller('questionMcqController', QuestionMcqController);
    
    // QuestionMcqController.$inject = [];
    function QuestionMcqController(){
        var $ctrl = this;

        //todo: auto resize text areas to fit contents
        //todo: use input type="number" in score and reading number
        //todo: check ng-options instead of ng-repeat in (correct answer)
        //  https://www.undefinednull.com/2014/08/11/a-brief-walk-through-of-the-ng-options-in-angularjs/

        
        //holds the new choice written in the textbox
        //to be added to array of choices
        $ctrl.new_choice = '';
        $ctrl.choiceAdd = function(){
            if( $ctrl.question.choiceAdd($ctrl.new_choice) ){
                //returns true if choice was added successfully
                $ctrl.new_choice = '';
            }else{
                //feature: display error to user,
                //reasons are either empty (or whitespaces only) new choice,
                //or choice already exists in choices array
            }
        }
    }
})();