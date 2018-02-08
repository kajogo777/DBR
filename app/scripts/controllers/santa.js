'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('SantaCtrl', function ($scope, $location, $http, $window, toastr, $interval,$state) {

    $scope.startGame = false;
    var user = JSON.parse($window.localStorage.getItem("user"));
    $scope.coinShow = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    $scope.coinsLeft = 13;
    $scope.time = 60;
    $scope.finalMessage = "";

    var user = JSON.parse($window.localStorage.getItem("user"));

    //check if played before
    $http.post($window.localStorage.getItem("base_url")+"/check_if_user_has_event",{"user_id":user._id,"type":"Christmas2018"}).then(function(response){
      console.log(response.data);
      if(response.data)
        $state.go('home');
    });


    var timer;
    $scope.startGameFunc = function () {
      $scope.startGame = true;
      timer = $interval(function () {
        $scope.time--;
        if ($scope.time == 0) {
          showFinalScore("Time is up and you found " + (13 - $scope.coinsLeft) + " coins. Santa will give you " + (13 - $scope.coinsLeft) * 2 + " bonus points. Merry Christmas !", (13 - $scope.coinsLeft) * 2);
          $interval.cancel(timer);
          timer = undefined;
        }
      }, 1000);
    }

    //var coinFoundSound = new Audio('http://soundbible.com/mp3/Magic Wand Noise-SoundBible.com-375928671.mp3');
    $scope.coinFound = function (coinNum) {
      if ($scope.time <= 0) {
        alert("time is up");
        return;
      }
      $scope.coinShow[coinNum] = 0;
      $scope.coinsLeft--;
      //coinFoundSound.play();
      new Audio('http://soundbible.com/mp3/Magic Wand Noise-SoundBible.com-375928671.mp3').play();
      if ($scope.coinsLeft == 0) {
        $interval.cancel(timer);
        timer = undefined;
        showFinalScore("Congratulations you found all the coins. Santa will give you 26 bonus points. Merry Christmas !", 26);
      }
      console.log(coinNum);
    }


    function showFinalScore(message, points) {
      $scope.startGame = false;

      

      $http.post($window.localStorage.getItem("base_url") + "/add_event_for_user", { "type": "Christmas2018", "points": points, "user": { "_id": user._id, "level": user.level, "level_score": user.level_score, "total_score": user.total_score } }).then(function (response) {
        console.log(response.data);
        if (response.data == "done") {
          $scope.finalMessage = message;
        } else {
          $scope.finalMessage = "An error has occurred!";
        }
      });

    }

  });

