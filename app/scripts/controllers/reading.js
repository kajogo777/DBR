'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('readingCtrl', function ($scope, $location, $http, $window, $state, $sce, $document, toastr) {
    $scope.user = JSON.parse($window.localStorage.getItem("user"));
    $scope.reading = undefined;
    $scope.date = Date.now();
    $scope.$state = $state;

    $scope.menuItems = [];
    angular.forEach($state.get(), function (item) {
      if (item.data && item.data.visible) {
        $scope.menuItems.push({ name: item.name, text: item.data.text });

      }
    });

    $http.post($window.localStorage.getItem("base_url") + "/get_today_reading", { user_id: $scope.user._id }).success(function (data, status) {
      console.log(data);
      if (status == 200) {
        if (data.sound && data.sound != "")
          data.sound = $scope.getAudioUrl(data.sound);
        // for(var question in data.questions){
        //   question.disabled= "";
        //   for(var user_ans_question in $scope.user.answered_questions){
        //     if(question.id==user_answered_question.question_id){
        //       question.disabled= "disabled";
        //       break;
        //     }
        //   }
        // }
        $scope.reading = data;
      };
      // var audioElement = angular.element( document.querySelector( '#audio' ) );
      // audioElement.src = data.sound;
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
      $http.post($window.localStorage.getItem("base_url") + "/check_answer", { "user_id": $scope.user._id, "question_id": question_id, "choice": input_answer, "reading_id": $scope.reading._id }).success(function (data, status) {
        console.log(data);
        if (status == 201) {
          toastr.warning(data);
        } else if (status == 202) {
          toastr.success(data);
        } else if (status == 203) {
          toastr.error(data);
        } else if (status == 204) {
          toastr.success(data);
          toastr.success("Congrats ... You leveled up !!");
        } else {
          console.log(data);
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
