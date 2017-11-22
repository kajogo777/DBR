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
   $scope.levelCelebrate= false;
   $scope.trophyCelebrate= false;
   $scope.newTrophy= undefined;
   $scope.showLoader=true;
   $scope.celebrations=[];
   $scope.selectedAnswer=[];


    $http.post($window.localStorage.getItem("base_url")+"/get_user",{"id":$scope.user._id}).then(function(response){
      console.log(response.data);
      if(response.status==200){
        $window.localStorage.setItem("user",JSON.stringify(response.data));
        $scope.user=response.data;
        $scope.answered_questions_ids= [];
        for(var i=0;i<$scope.user.answered_questions.length;i++){
          $scope.answered_questions_ids.push($scope.user.answered_questions[i].question_id);
        }
        console.log('answered_questions_ids: ', $scope.answered_questions_ids);

      }
    });

    $scope.reading = undefined;
    $scope.date = Date.now();
    $scope.$state = $state;

   

    $http.post($window.localStorage.getItem("base_url") + "/get_today_reading", { user_id: $scope.user._id }).then(function (response) {
      console.log(response.data);
      if (response.data.reading != undefined) {
        if (response.data.reading.sound && response.data.reading.sound != "")
          response.data.sound = $scope.getAudioUrl(response.data.sound);

        $scope.reading = response.data.reading;

        if(response.data.newTrophy != undefined){
          //toastr.info("Congrats ... New Trophy for " +response.data.newTrophy.title+ " !");
         // toastr.success("You got "+response.data.newTrophy.points+" points from the new trophy");
          $scope.celebrations.push("trophyCelebration");
          $scope.newTrophy= response.data.newTrophy;
        }

        if(response.data.LevelChanged != undefined){
          // toastr.success("Congrats ... You leveled up !!");
          //$scope.levelCelebrate= true;
          $scope.celebrations.push("levelCelebration");
        }

        
       };

       for(var i=0;i< $scope.reading.questions.length;i++){
        $scope.selectedAnswer.push(-1);
       }

      // var audioElement = angular.element( document.querySelector( '#audio' ) );
      // audioElement.src = response.data.sound;
      // audioElement.play(); 
      $scope.checkCelebration();
      $scope.showLoader=false;
    });
    $scope.getAudioUrl = function (sound) {
      return $sce.trustAsResourceUrl(sound);
    };

    $scope.check_answer = function (input_answer, question_id, choice_id, question_index) {
      console.log($scope.selectedAnswer);
      if($scope.selectedAnswer[question_index] !=choice_id){
          $scope.selectedAnswer[question_index] = choice_id;
          return;
      }
      //disabling answers
      for (var i = 0; i < $scope.reading.questions[question_index].choices.length; i++) {
        var right_element = $document[0].getElementById("atag_"+question_index + "_" + i);
        right_element.className += " disabled";
      }
      $http.post($window.localStorage.getItem("base_url") + "/check_answer", { "user_id": $scope.user._id, "question_id": question_id, "choice": input_answer, "reading_id": $scope.reading._id }).then(function (response) {
        console.log(response.data);
        if(response.data.question_score != undefined){
            toastr.success("+"+response.data.question_score+" points.");
        }

        if(response.data.newTrophy != undefined){
          // toastr.info("Congrats ... New Trophy for " +response.data.newTrophy.title+ " !");
          // toastr.success("You got "+response.data.newTrophy.points+" points from the new trophy");
          $scope.celebrations.push("trophyCelebration");
          $scope.newTrophy= response.data.newTrophy;
         }

        if(response.data.LevelChanged != undefined){
         // toastr.success("Congrats ... You leveled up !!");
         // $scope.levelCelebrate= true;
         $scope.celebrations.push("levelCelebration");
        }
        
        if(response.data.question_score == undefined){
          toastr.error("Wrong answer :(");
      }

      $scope.checkCelebration();
        // if (response.status == 201) {
        //   toastr.warning(response.data);
        // } else if (response.status == 202) {
        //   toastr.success(response.data);
        // } else if (response.status == 203) {
        //   toastr.error(response.data);
        // } else if (response.status == 204) {
        //   toastr.success(response.data);
        //   toastr.success("Congrats ... You leveled up !!");
        // } else {
        //   console.log(response.data);
        // }
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


    $scope.get_answered_question = function(question_id){
      for(var i=0;i<$scope.user.answered_questions.length;i++){
        if($scope.user.answered_questions[i].question_id==question_id){
            return $scope.user.answered_questions[i];
        }
      }
      
      //$scope.checkCelebration();
    }


    $scope.checkCelebration= function(){
      console.log($scope.celebrations);
      $scope.levelCelebrate= false;
      $scope.trophyCelebrate= false;

      if($scope.celebrations[0]=="trophyCelebration") 
      $scope.trophyCelebrate= true; 

      if($scope.celebrations[0]=="levelCelebration")
        $scope.levelCelebrate= true;

      $scope.celebrations.shift();  
    }

    // toastr.success('Hello world!', 'Toastr fun!');

  });
