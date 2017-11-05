'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('ViewKidsCtrl', function($scope, $location,$http,$window,toastr) {
  	
  	
      var user=JSON.parse($window.localStorage.getItem("user"));

      
      	
        $http.post($window.localStorage.getItem("base_url")+"/get_class_users",{"class":user.class }).then(function(response){
					console.log(response.data);
          $scope.myKids = response.data;
        }); 

        $scope.delete_user=  function(id,index,name){
          var deleteUser = $window.confirm('Are you absolutely sure you want to delete '+ name +'?');
          if(deleteUser){
            $http.post($window.localStorage.getItem("base_url")+"/delete_user",{"id":id }).then(function(response){
              console.log(response.data);
              toastr.success(name+" deleted");
              $scope.myKids.splice(index,1);
            });
          }
         
        }

    });

