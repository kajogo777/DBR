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
    //setting base address
    if($location.absUrl().includes("localhost")){
      $window.localStorage.setItem("base_url","http://localhost:5000");
    }else if($location.absUrl().includes("dbrtest")){
       $window.localStorage.setItem("base_url","https://dbrtest.herokuapp.com");
   }else{
      $window.localStorage.setItem("base_url","https://dbr.herokuapp.com");
    }
    
    if(localStorage.getItem("user")!= undefined){
      $location.path('/dashboard');
    }
    
    $scope.login_failed=undefined;
    $scope.submit = function(username,password) {
      $http.post($window.localStorage.getItem("base_url")+"/login",{"username":username,"password":password}).then(function(response){
        console.log(response.data);
        if(response.status==200){
          $window.localStorage.setItem("user",JSON.stringify(response.data));
          $location.path('/dashboard');
        }else if(response.status==201){
          console.log(response.data);
          $scope.login_failed=response.data;
        }
        
      });
      

      return false;
    }

  });
