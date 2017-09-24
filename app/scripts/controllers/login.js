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

    $scope.submit = function() {
      $http.post("http://dbr.herokuapp.com/login",{"username":$scope.username,"password":$scope.password});
      $location.path('/dashboard');

      return false;
    }

  });
