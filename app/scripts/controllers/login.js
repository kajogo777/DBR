'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('LoginCtrl', function($scope, $location,$http) {

    $scope.submit = function(username,password) {
      $http.post("http://dbr.herokuapp.com/login",{"username":username,"password":password}).success(function(data){
        console.log(data);
        $location.path('/dashboard');
      });
      

      return false;
    }

  });
