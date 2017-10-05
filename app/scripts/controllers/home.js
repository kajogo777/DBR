'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('HomeCtrl', function($scope,$http,$window,$state,$location) {
    $scope.user=JSON.parse($window.localStorage.getItem("user"));
    $scope.next_level=undefined;
    $scope.$state = $state;
    
        $scope.menuItems = [];
        angular.forEach($state.get(), function (item) {
            if (item.data && item.data.visible) {
                $scope.menuItems.push({name: item.name, text: item.data.text});
            }
        });

        $http.post($window.localStorage.getItem("base_url")+"/get_user",{"id":$scope.user._id}).then(function(response){
          console.log(response.data);
          if(response.status==200){
            $window.localStorage.setItem("user",JSON.stringify(response.data));
            $scope.user=response.data;
          }
        });

        $http.post($window.localStorage.getItem("base_url")+"/next_level",{"level":$scope.user.level+1}).then(function(response){
          console.log(response.data);
          if(response.status==200){
            $scope.next_level=response.data;
          }
        });
        $http.post($window.localStorage.getItem("base_url")+"/get_top_5").then(function(response){
          if(response.status==200){
            $scope.topKids=response.data;
            console.log($scope.topKids);
          }
        });
        $http.post($window.localStorage.getItem("base_url")+"/get_top_5_in_class",{"class":$scope.user.class}
          ).then(function(response){
          if(response.status==200){
            $scope.topKidsInClass=response.data;
            console.log($scope.topKids);
          }
        });    

        $scope.logout= function(){
          $window.localStorage.removeItem("user","");
          $location.path('/login');
        }


  });
