'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('AddKidsCtrl', function($scope, $location,$http,$window,toastr) {
  	var myDate = new Date();

  	$scope.minDate = new Date(
    	myDate.getFullYear() - 12,
    	myDate.getMonth(),
    	myDate.getDate()
  	);

  	$scope.maxDate = new Date(
    	myDate.getFullYear() - 9,
    	myDate.getMonth(),
    	myDate.getDate()
  	);
      var kids = [];
  	
      var user=JSON.parse($window.localStorage.getItem("user"));
      for (var i = 1; i <= 50; i++) {
      	kids.push({
      		name: "",
      		username:"",
					birthdate:"",
					class:user.class
      	});
      }

      $scope.kids = kids;
      $scope.add_users = function(reading){
      	var users = $scope.kids;
      	console.log(users[0]);

				
        $http.post($window.localStorage.getItem("base_url")+"/add_users",{"users":kids }).then(function(response){
          if(response.status==200){
            toastr.success(response.data);
          }else{
            toastr.error(response.data);
          }
        }); 
        console.log(reading);
			}
			
			$scope.get_class_users = function(reading){
      	
        $http.post($window.localStorage.getItem("base_url")+"/get_class_users",{"class":user.class }).then(function(response){
					console.log(response.data);
        }); 
      }
      return false;
    });

