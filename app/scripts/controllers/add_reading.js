'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('AddReadingCtrl', function($scope, $location,$http,$window, toastr) {
  
      
      $scope.add_reading = function(reading){
        // reading.content= reading.content.split("\n").join("<br />");
        var input_questions =reading.questions.split("\n"); 
        var input_answers =reading.answers.split("\n");
        var input_scores =reading.scores.split("\n");
        var input_choices =reading.choices.split("\n\n");

        var questions = [];
        for(var i =0;i<input_questions.length;i++){
          var question={
            "id":makeid(),
            "question":input_questions[i],
            "answer": input_answers[i],
            "choices": input_choices[i].split("\n"),
            "score": input_scores[i],
            "type":"mcq"
          };
          questions.push(question);
        }
        // console.log(question);
        reading.questions=questions;
        function makeid(){
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          
            for (var i = 0; i < 40; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          
            return text;
        }

        $http.post($window.localStorage.getItem("base_url")+"/add_reading",{"reading":reading}).then(function(response){
          if(response.status==200){
            toastr.success(response.data);
          }else{
            toastr.error(response.data);
          }
        }); 
        console.log(reading);
      }
      return false;
    });

