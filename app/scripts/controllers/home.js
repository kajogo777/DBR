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
    $scope.level_progressbar_colors=['#1a8ebc','#9c1abc','#f44336','#8bc34a','#ffc107','#00bcd4','#c700d4','#d47f00','#48d400','#aa00d4'];
    
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


        $scope.classes= [];
        $http.get($window.localStorage.getItem("base_url")+"/get_classes_and_scores").then(function(response){
          if(response.status==200){
            var users =response.data;

            //getting total score and users counter
            for(var i =0;i<users.length;i++){
              if( !$scope.classes[users[i].class]){
                $scope.classes[users[i].class]={total_score:0,users_count:0,average:0};
              }
                $scope.classes[users[i].class].total_score += users[i].total_score;
                $scope.classes[users[i].class].users_count++;
            }

            //taking average
            for(var i=0;i<users.length;i++){
              $scope.classes[users[i].class].average= $scope.classes[users[i].class].total_score/$scope.classes[users[i].class].users_count;
            }

            //converting associative array to regular array
            var tmp=[];
            for(var c in $scope.classes){
             tmp.push({class_name: c,average:$scope.classes[c].average});
            }

            $scope.classes=tmp;

            //sort
            $scope.classes.sort(function(a,b){return b.average-a.average});
            
            console.log($scope.classes);
          }
        });


        if($scope.user.admin>=5){
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
  
        }

        

       

        $scope.logout= function(){
          $window.localStorage.removeItem("user","");
          $location.path('/login');
        }


  });
