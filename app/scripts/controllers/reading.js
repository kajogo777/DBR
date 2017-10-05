'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('readingCtrl', function ($scope, $location, $http, $window, $state, $sce, $document) {
    $scope.user = JSON.parse($window.localStorage.getItem("user"));
    $scope.reading = undefined;
    $scope.date = Date.now();
    $scope.$state = $state;

   

    $http.post($window.localStorage.getItem("base_url") + "/get_today_reading", { user_id: $scope.user._id }).then(function (response) {
      console.log(response.data);
      if (response.status == 200) {
        if (response.data.sound && response.data.sound != "")
          response.data.sound = $scope.getAudioUrl(response.data.sound);
        // for(var question in response.data.questions){
        //   question.disabled= "";
        //   for(var user_ans_question in $scope.user.answered_questions){
        //     if(question.id==user_answered_question.question_id){
        //       question.disabled= "disabled";
        //       break;
        //     }
        //   }
        // }
        $scope.reading = response.data;
      };
      // var audioElement = angular.element( document.querySelector( '#audio' ) );
      // audioElement.src = response.data.sound;
      // audioElement.play(); 

    });
    $scope.getAudioUrl = function (sound) {
      return $sce.trustAsResourceUrl(sound);
    };

    $scope.check_answer = function (input_answer, question_id, choice_id, question_index) {
      //disabling answers
      for (var i = 0; i < $scope.reading.questions[question_index].choices.length; i++) {
        var right_element = $document[0].getElementById("atag_"+question_index + "_" + i);
        right_element.className += " disabled";
      }
      $http.post($window.localStorage.getItem("base_url") + "/check_answer", { "user_id": $scope.user._id, "question_id": question_id, "choice": input_answer, "reading_id": $scope.reading._id }).then(function (response) {
        console.log(response.data);
        if (response.status == 201) {
          toastr.warning(response.data);
        } else if (response.status == 202) {
          toastr.success(response.data);
        } else if (response.status == 203) {
          toastr.error(response.data);
        } else if (response.status == 204) {
          toastr.success(response.data);
          toastr.success("Congrats ... You leveled up !!");
        } else {
          console.log(response.data);
        }
      });
      // console.log(input_answer+" "+question_id+" "+choice_id);
      //checking answer
      var selected_element = $document[0].getElementById(question_index + "_" + choice_id);
      if (input_answer == $scope.reading.questions[question_index].answer) {
        console.log("right answer");
      }
      selected_element.style.backgroundColor = "red";
      //coloring the right answer
      for (var i = 0; i < $scope.reading.questions[question_index].choices.length; i++) {
        if ($scope.reading.questions[question_index].choices[i] == $scope.reading.questions[question_index].answer) {
          var right_element = $document[0].getElementById(question_index + "_" + i);
          right_element.style.backgroundColor = "green";
          break;
        }
      }

    };


    // toastr.success('Hello world!', 'Toastr fun!');

  });
