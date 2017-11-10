'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('GiftsCtrl', function($scope, $location,$http,$window) {

      $scope.gifts =[];
      $scope.levels=[];
  	
      $scope.user=JSON.parse($window.localStorage.getItem("user"));
        $http.get($window.localStorage.getItem("base_url")+"/get_gifts").then(function(response){
					console.log(response.data);
          var gifts = response.data;
          $scope.gifts=gifts;
          //max_level=gifts[gifts.length-1].level;
          for(var i=0;i<gifts.length;i++){
            $scope.levels.push(gifts[i].level);
          }
          
        });
    });

