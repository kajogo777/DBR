'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('TrophiesCtrl', function($scope, $location,$http,$window) {
  	
  	
      var user=JSON.parse($window.localStorage.getItem("user"));
      $scope.reading_days_trophies=[];
      $scope.reading_row_trophies=[];
      $scope.correct_answers_row_trophies=[];
        $http.get($window.localStorage.getItem("base_url")+"/get_trophies").then(function(response){
					console.log(response.data);
          var trophies = response.data;

          for(var i=0;i<trophies.length;i++){
            console.log(trophies[i].type);
            if(trophies[i].type=="reading_days")
              $scope.reading_days_trophies.push(trophies[i]);
            else if(trophies[i].type=="reading_row")
              $scope.reading_row_trophies.push(trophies[i]);
            else if(trophies[i].type=="correct_answers_row")
              $scope.correct_answers_row_trophies.push(trophies[i]);
          }
        }); 

        $scope.check_if_trophy_earned = function(trophy_id){
          for(var i=0;i<user.trophies.length;i++){
            if(user.trophies[i].trophy._id==trophy_id){
                return "";
            }
          }
          return "decrease_opacity";
        }

        $scope.check_if_trophy_earned_bool = function(trophy_id){
          for(var i=0;i<user.trophies.length;i++){
            if(user.trophies[i].trophy._id==trophy_id){
                return true;
            }
          }
          return false;
        }
    });

