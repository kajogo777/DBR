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

      $http.get($window.localStorage.getItem("base_url")+"/get_readings").then(function(response){
        $scope.readings= response.data;
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_trophies").then(function(response){
        $scope.trophies= response.data;
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_levels").then(function(response){
        $scope.levels= response.data;
      });




    });

