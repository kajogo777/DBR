'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('AdminStatsCtrl', function($scope, $location,$http,$window,) {
  	
  	
      var user=JSON.parse($window.localStorage.getItem("user"));
      $scope.readings=[];
      $scope.trophies=[];
      $scope.weeks=[];
      $scope.days=[];

      $http.get($window.localStorage.getItem("base_url")+"/get_readings").then(function(response){
        for(var i=0;i<Math.ceil(response.data.length/7);i++){
          $scope.weeks.push(i);
        }
        $scope.readings= response.data;
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_trophies").then(function(response){
        $scope.trophies= response.data;
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_levels").then(function(response){
        $scope.levels= response.data;
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_reading_dates").then(function(response){
        var users = response.data;
        var days_array = [];
        for(var u=0;u<users.length;u++){
          var reading_date_of_user = users[u].reading_dates;
          for(var d=0;d<reading_date_of_user.length;d++){
            var date = new Date(reading_date_of_user[d]);
            date = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
            var date_index= days_array.indexOf(date);
            if(date_index<0){
              days_array.push(date);
              $scope.days.push({
                date: date,
                users_counter: 1
              });
            }else{
              $scope.days[date_index].users_counter++;
            }
          }
        }
        $scope.days.sort(function(a,b) {return (a.date > b.date) ? 1 :0});
        console.log($scope.days);
      });




    });

