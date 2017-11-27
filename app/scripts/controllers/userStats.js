'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('UserStatsCtrl', function($scope, $location,$http,$window,$stateParams) {
  	
  	
      var user=JSON.parse($window.localStorage.getItem("user"));
      $scope.user_opening_browser = user;
      var id = $stateParams.id;
      
      $scope.calendarView = 'month';
      $scope.calendarTitle="Readings Calendar";
      $scope.viewDate= new Date(Date.now());
      $scope.cellIsOpen=false;
      $scope.readings=[];

      $scope.correctAnswers= 0;

      $http.post($window.localStorage.getItem("base_url")+"/get_user",{"id":id}).then(function(response){
        console.log(response.data);
        if(response.status==200){
          $scope.user=response.data;
          for(var i=0;i<$scope.user.reading_dates.length;i++){
            var reading_number=i+1;
            $scope.readings.push({
                title: "reading "+ reading_number,
                startsAt: new Date($scope.user.reading_dates[i]),
                color: { // can also be calendarConfig.colorTypes.warning for shortcuts to the deprecated event types
                  primary: '#26ff26', // the primary event color (should be darker than secondary)
                  secondary: '#fdf1ba' // the secondary event color (should be lighter than primary)
                },
                allDay: true,
                incrementsBadgeTotal: false,
            })
          }

          for(var i=0;i<$scope.user.answered_questions.length;i++){
            if($scope.user.answered_questions[i].is_right_answer == true)
              $scope.correctAnswers++;
          }

          console.log($scope.readings);
        }
      });


    });

