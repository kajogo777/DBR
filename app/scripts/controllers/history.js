'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('HistoryCtrl', function ($scope, $location, $http, $window, $state, $sce, $document) {
    $scope.user = JSON.parse($window.localStorage.getItem("user"));

  });
