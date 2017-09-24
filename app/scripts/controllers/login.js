'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('LoginCtrl', function($scope, $location,$http,$window) {
    $scope.login_failed=undefined;
    $scope.submit = function(username,password) {
      $http.post("https://dbr.herokuapp.com/login",{"username":username,"password":password}).success(function(data,status){
        console.log(data);
        if(status==200){
          $window.localStorage.setItem("user",JSON.stringify(data));
          $location.path('/dashboard');
        }else if(status==201){
          console.log(data);
          $scope.login_failed=data;
        }
        
      });
      

      return false;
    }

  });
