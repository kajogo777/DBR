'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('AdminStatsCtrl', function($scope, $location,$http,$window,) {
  	
  	
      var user=JSON.parse($window.localStorage.getItem("user"));
      $scope.readings=[];
      $scope.trophies=[];
      $scope.weeks=[];

      $http.get($window.localStorage.getItem("base_url")+"/get_readings").then(function(response){
        for(var i=0;i<Math.ceil(response.data.length/7);i++){
          $scope.weeks.push(i);
        }
        $scope.readings= response.data;
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_trophies").then(function(response){
        $scope.trophies= response.data;
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_levels").then(function(response){
        $scope.levels= response.data;
      });




    });

