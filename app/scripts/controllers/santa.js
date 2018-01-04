'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('SantaCtrl', function($scope, $location,$http,$window,toastr,$interval) {
  	
      $scope.startGame=false;
      var user=JSON.parse($window.localStorage.getItem("user"));
      $scope.coinShow=[1,1,1,1,1,1,1,1,1,1,1,1,1];
      $scope.coinsLeft=13;
      $scope.time=60;
      $scope.finalMessage="";

      var timer;
      $scope.startGameFunc = function(){
        $scope.startGame=true;
        timer = $interval(function(){
          $scope.time--;
          if($scope.time == 0){
            showFinalScore("Time is up and you found "+(13-$scope.coinsLeft)+" coins. Santa will give you "+(13-$scope.coinsLeft)*2+" bonus points. Merry Christmas !");
            $interval.cancel(timer); 
            timer = undefined;
          }
        },1000);
      }
     
      var coinFoundSound = new Audio('http://soundbible.com/mp3/Magic Wand Noise-SoundBible.com-375928671.mp3');
      $scope.coinFound = function(coinNum){
        if($scope.time<=0){
          alert("time is up");
          return;
        }
        $scope.coinShow[coinNum]=0;
        $scope.coinsLeft--;
        coinFoundSound.play();
        if($scope.coinsLeft==0){
          $interval.cancel(timer); 
          timer = undefined;
          showFinalScore("Congratulations you found all the coins. Santa will give you 26 bonus points. Merry Christmas !");
        }
        console.log(coinNum);
      }

      function showFinalScore(message){
        $scope.finalMessage=message;
        $scope.startGame=false;
      }

    });

