'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('AdminStatsCtrl', function($scope, $location,$http,$window) {
  	
  	
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
        for(var i=0;i<$scope.levels.length-1;i++){
          $scope.levels[i].users_count -= $scope.levels[i+1].users_count;
          // for(var j=i+1;j<$scope.levels.length;j++){
          //   $scope.levels[i].users_count -= $scope.levels[j].users_count;
          // }
        }
      });

      $http.get($window.localStorage.getItem("base_url")+"/get_reading_dates").then(function(response){
        var users = response.data;
        var days_array = [];
        for(var u=0;u<users.length;u++){
          var reading_date_of_user = users[u].reading_dates;
          for(var d=0;d<reading_date_of_user.length;d++){
            var tmp = new Date(reading_date_of_user[d]);
            var date = new Date(tmp.toDateString());
            // date.setDate(tmp.getDate());
            // date.setMonth(tmp.getMonth());
            // date.setFullYear(tmp.getFullYear());
            
            var date_index= days_array.indexOf(date.toDateString());
            if(date_index<0){
              days_array.push(date.toDateString());
              $scope.days.push({
                date: date,
                users_counter: 1
              });
            }else{
              $scope.days[date_index].users_counter++;
            }
          }
        }
        // $scope.days.sort(function(a,b) {return (new Date(a.date) > new Date(b.date)) ? 1 :0});
        $scope.days.sort(function(a,b) {return new Date(a.date)- new Date(b.date)});
        console.log($scope.days);
      });

      $scope.gifts=[];
      $http.get($window.localStorage.getItem("base_url")+"/get_all_users_gifts").then(function(response){
        console.log(response.data);
        var users = response.data;
        var gifts = [];
        for(var i=0;i<users.length;i++){ 
          if(!users[i].gift)
            continue;
            var gift_index= gifts.indexOf(users[i].gift._id);
            if(gift_index<0){
              gifts.push(users[i].gift._id);
              $scope.gifts.push({
                _id:users[i].gift._id,
                title: users[i].gift.title,
                users_counter: 1
              });
            }else{
              $scope.gifts[gift_index].users_counter++;
            }
          
        }
      });


    });

