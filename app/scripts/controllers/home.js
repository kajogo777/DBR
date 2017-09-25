'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('HomeCtrl', function($scope,$http,$window,$state) {
    $scope.user=JSON.parse($window.localStorage.getItem("user"));
    $scope.next_level=undefined;
    $scope.$state = $state;
    
        $scope.menuItems = [];
        angular.forEach($state.get(), function (item) {
            if (item.data && item.data.visible) {
                $scope.menuItems.push({name: item.name, text: item.data.text});
            }
        });

        $http.post($window.localStorage.getItem("base_url")+"/get_user",{"id":$scope.user._id}).success(function(data,status){
          console.log(data);
          if(status==200){
            $window.localStorage.setItem("user",JSON.stringify(data));
            $scope.user=data;
          }
        });

        $http.post($window.localStorage.getItem("base_url")+"/next_level",{"level":$scope.user.level+1}).success(function(data,status){
          console.log(data);
          if(status==200){
            $scope.next_level=data;
          }
        });  

  });
