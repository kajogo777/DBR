'use strict';

/**
 * @ngdoc overview
 * @name yapp
 * @description
 * # yapp
 *
 * Main module of the application.
 */
var states = [
        { name: 'base', state: { abstract: true, url: '', templateUrl: 'views/base.html', data: {text: "Base", visible: false } } },
        { name: 'login', state: { url: '/login', parent: 'base', templateUrl: 'views/login.html', controller: 'LoginCtrl', data: {text: "Login", visible: false } } },
        { name: 'dashboard', state: { url: '/dashboard', parent: 'base', templateUrl: 'views/dashboard.html', controller: 'DashboardCtrl', data: {text: "Dashboard", visible: false } } },
        { name: 'overview', state: { url: '/overview', parent: 'dashboard', templateUrl: 'views/dashboard/overview.html', data: {text: "Overview", visible: true } } },
        { name: 'reports', state: { url: '/reports', parent: 'dashboard', templateUrl: 'views/dashboard/reports.html', data: {text: "Reports", visible: true } } },
        { name: 'logout', state: { url: '/login', data: {text: "Logout", visible: true }} },
        { name: 'home', state: { url: '/home',templateUrl: 'views/home.html', controller: 'HomeCtrl', parent: 'dashboard'}},
        { name: 'reading', state: { url: '/reading',templateUrl: 'views/reading.html', controller: 'readingCtrl', parent: 'dashboard'}},
        { name: 'add_reading', state: { url: '/add_reading',templateUrl: 'views/add_reading.html', controller: 'AddReadingCtrl', parent: 'dashboard'}},
        { name: 'add_kids', state: { url: '/add_kids',templateUrl: 'views/add_kids.html', controller: 'AddKidsCtrl', parent: 'dashboard'}},
        { name: 'view_kids', state: { url: '/view_kids',templateUrl: 'views/view_kids.html', controller: 'ViewKidsCtrl', parent: 'dashboard'}},
        { name: 'history', state: { url: '/history',templateUrl: 'views/history.html', controller: 'HistoryCtrl', parent: 'dashboard'}},
        { name: 'trophies', state: { url: '/trophies',templateUrl: 'views/trophies.html', controller: 'TrophiesCtrl', parent: 'dashboard'}},
        { name: 'gifts', state: { url: '/gifts',templateUrl: 'views/gifts.html', controller: 'GiftsCtrl', parent: 'dashboard'}}
    ];
   
angular.module('yapp', [
                'ui.router',
                'ngAria',
                'ngAnimate',
                'ngMessages',
                'ngMaterial',
				'toastr',
                'readings' //the Reading Manager module
            ])
        .config(function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.when('/dashboard', '/dashboard/home');
            $urlRouterProvider.otherwise('/login');
            
            angular.forEach(states, function (state) {
                $stateProvider.state(state.name, state.state);
            });
        });
