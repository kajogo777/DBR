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

      $scope.now = Date.now();
      $scope.subDates= function(lastSeen){
        return moment(lastSeen).fromNow();
        moment().diff( moment(lastSeen), 'days');
      }
      	
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

        $scope.edit_user = function(kid){
          var name = prompt("Edit name : ", kid.name);
          var username = prompt("Edit username : ", kid.username);
          var password = prompt("Edit password : ", kid.password);
          
          if(name != null)
            kid.name = name;
          if(username != null)
            kid.username = username;
          if(password != null)
            kid.password = password;

          $http.post($window.localStorage.getItem("base_url")+"/update_user",{"id":kid._id,"name":kid.name,"username":kid.username,"password":kid.password }).then(function(response){
              toastr.success(name+" updated");
          });
        }

    });

