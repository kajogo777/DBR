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
  	
  	
      var user=JSON.parse($window.localStorage.getItem("user"));
      $scope.coinShow=[1,1,1,1,1,1,1,1,1,1,1,1,1];
      $scope.coinsLeft=13;
      $scope.time=60;

      var timer = $interval(function(){
        $scope.time--;
        if($scope.time == 0){
          alert("time is up");
          $interval.cancel(timer); 
          timer = undefined;
        }
      },1000);

      $scope.coinFound = function(coinNum){
        if($scope.time<=0){
          alert("time is up");
          return;
        }
        $scope.coinShow[coinNum]=0;
        $scope.coinsLeft--;
        console.log(coinNum);
      }

    });

