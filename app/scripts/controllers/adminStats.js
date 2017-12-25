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
      $scope.chart_options=undefined;
      var scores_interval=50;
      $scope.scores_chart_options = {
        data: [],
        dimensions: {
          users: {
            type: 'line',
            axis: 'y1',
            dataType:'numeric',
            color: 'orange',
            label: true,
            name: 'total scores'
          },
          scores:{
            axis: 'x',
            dataType:'numeric',
            displayFormat:function (x) {
              var lower_bound=x-scores_interval;
                if(x%scores_interval!=0){
                  for(var i=x;i>=0;i--)
                    if(i%50==0){
                      lower_bound=i
                      break;
                    }
                } 
              return lower_bound+"-"+x;
            }
          },
        }
      };

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

        $scope.chart_options = {
          data: [],
          dimensions: {
            users: {
              type: 'line',
              axis: 'y1',
              dataType:'numeric',
              color: 'orange',
              label: true
            },
            dates:{
              axis: 'x',
              dataType:'datetime',
              displayFormat:function (x) {var month=x.getMonth()+1; return x.getDate()+"/"+month;}
            }
          }
        };

        for(var i=0;i<$scope.days.length-1;i++){
          $scope.chart_options.data.push({
            users: $scope.days[i].users_counter,
             dates: $scope.days[i].date
          })
        }

      });

      $http.get($window.localStorage.getItem("base_url")+"/get_all_scores").then(function(response){
        console.log(response.data);
        var input_scores = response.data;
        var scores = [];
        
        //counting users per each score
        for(var i=0;i<input_scores.length;i++){
          if(!scores[input_scores[i].total_score])
            scores[input_scores[i].total_score]=1;
          else
            scores[input_scores[i].total_score]++;
        }

        var current_interval_counter=0;
        for(var i=0;i<scores.length;i++){
          if(scores[i])
             current_interval_counter+= scores[i];
          if(i%scores_interval==0 && i!=0 || i==scores.length-1){
            $scope.scores_chart_options.data.push({
              users: current_interval_counter,
              scores: i
            })
            current_interval_counter=0;
          }
        }

        
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

