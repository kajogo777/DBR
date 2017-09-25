'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp',['ngAnimate',
'toastr'])
  .controller('readingCtrl', function($scope, $location,$http,$window,$state,$sce,toastr) {
    $scope.user=JSON.parse($window.localStorage.getItem("user"));
    $scope.reading=undefined;
    $scope.date=Date.now();
    $scope.$state = $state;
    
        $scope.menuItems = [];
        angular.forEach($state.get(), function (item) {
            if (item.data && item.data.visible) {
                $scope.menuItems.push({name: item.name, text: item.data.text});
            }
        });

        $http.post($window.localStorage.getItem("base_url")+"/get_today_reading").success(function(data,status){
          console.log(data);
          if(status==200){
            $scope.reading=data;
          };
            // var audioElement = angular.element( document.querySelector( '#audio' ) );
            // audioElement.src = data.sound;
            // audioElement.play(); 
          
        });
        $scope.getAudioUrl = function() {
          return $sce.trustAsResourceUrl($scope.reading.sound);
        };

     
        toastr.success('Hello world!', 'Toastr fun!');
        
  });
