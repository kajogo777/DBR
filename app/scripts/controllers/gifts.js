'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('GiftsCtrl', function($scope, $location,$http,$window,toastr) {

      $scope.gifts =[];
      $scope.levels=[];
  	
      $scope.user=JSON.parse($window.localStorage.getItem("user"));
        $http.get($window.localStorage.getItem("base_url")+"/get_gifts").then(function(response){
					console.log(response.data);
          var gifts = response.data;
          $scope.gifts=gifts;
          //max_level=gifts[gifts.length-1].level;
          for(var i=0;i<gifts.length;i++){
            $scope.levels.push(gifts[i].level);
          }
          
        });
        $scope.currentlyProccessedGift="";
        $scope.selectGift = function(giftID,giftTitle){
          $scope.currentlyProccessedGift=giftID;
          $http.post($window.localStorage.getItem("base_url")+"/select_gift",{user_id:$scope.user._id,gift_id:giftID}).then(function(response){
            console.log(response.data);
            $scope.user= response.data;
            $window.localStorage.setItem("user",JSON.stringify(response.data));
            $scope.currentlyProccessedGift="";
            toastr.success(giftTitle+ " selected");
            
          });
        }
    });

