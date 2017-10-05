'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('ViewKidsCtrl', function($scope, $location,$http,$window) {
  	
  	
      var user=JSON.parse($window.localStorage.getItem("user"));

      
      	
        $http.post($window.localStorage.getItem("base_url")+"/get_class_users",{"class":user.class }).then(function(response){
					console.log(response.data);
          $scope.myKids = response.data;
        }); 
    });

