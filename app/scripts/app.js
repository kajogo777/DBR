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
    { name: 'base', cache: false, state: { abstract: true, url: '', templateUrl: 'views/base.html', data: { text: "Base", visible: false } } },
    { name: 'login', cache: false, state: { url: '/login', parent: 'base', templateUrl: 'views/login.html', controller: 'LoginCtrl', data: { text: "Login", visible: false } } },
    { name: 'dashboard', cache: false, state: { url: '/dashboard', parent: 'base', templateUrl: 'views/dashboard.html', controller: 'DashboardCtrl', data: { text: "Dashboard", visible: false } } },
    { name: 'overview', cache: false, state: { url: '/overview', parent: 'dashboard', templateUrl: 'views/dashboard/overview.html', data: { text: "Overview", visible: true } } },
    { name: 'reports', cache: false, state: { url: '/reports', parent: 'dashboard', templateUrl: 'views/dashboard/reports.html', data: { text: "Reports", visible: true } } },
    { name: 'logout', cache: false, state: { url: '/login', data: { text: "Logout", visible: true } } },
    { name: 'home', cache: false, state: { url: '/home', templateUrl: 'views/home.html', controller: 'HomeCtrl', parent: 'dashboard' } },
    { name: 'reading', cache: false, state: { url: '/reading', templateUrl: 'views/reading.html', controller: 'readingCtrl', parent: 'dashboard' } },
    { name: 'add_reading', cache: false, state: { url: '/add_reading', templateUrl: 'views/add_reading.html', controller: 'AddReadingCtrl', parent: 'dashboard' } },
    { name: 'add_kids', cache: false, state: { url: '/add_kids', templateUrl: 'views/add_kids.html', controller: 'AddKidsCtrl', parent: 'dashboard' } },
    { name: 'view_kids', cache: false, state: { url: '/view_kids', templateUrl: 'views/view_kids.html', controller: 'ViewKidsCtrl', parent: 'dashboard' } },
    { name: 'history', cache: false, state: { url: '/history', templateUrl: 'views/history.html', controller: 'HistoryCtrl', parent: 'dashboard' } },
    { name: 'trophies', cache: false, state: { url: '/trophies', templateUrl: 'views/trophies.html', controller: 'TrophiesCtrl', parent: 'dashboard' } },
    { name: 'gifts', cache: false, state: { url: '/gifts', templateUrl: 'views/gifts.html', controller: 'GiftsCtrl', parent: 'dashboard' } },
    { name: 'userStats', cache: false, state: { url: '/userStats/:id', templateUrl: 'views/userStats.html', controller: 'UserStatsCtrl', parent: 'dashboard' } },
    { name: 'adminStats', cache: false, state: { url: '/adminStats', templateUrl: 'views/adminStats.html', controller: 'AdminStatsCtrl', parent: 'dashboard' } }
];

var app = angular.module('yapp', [
    'ui.router',
    'ngAria',
    'ngAnimate',
    'ngMessages',
    'ngMaterial',
    'toastr',
    'readings', //the Reading Manager module
    'mwl.calendar',
    'vAccordion'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('/dashboard', '/dashboard/home');
    $urlRouterProvider.otherwise('/login');

    angular.forEach(states, function (state) {
        $stateProvider.state(state.name, state.state);
    });


});

app.run(function ($location, $window, $state) {
    //set base url
    $window.localStorage.setItem("base_url", new $window.URL($location.absUrl()).origin);

    if ($location.absUrl().includes("localhost")) {
        $window.localStorage.setItem("base_url", "http://localhost:5000");
    }

    //if user is not logged in redirect him back to login
    if (!localStorage.getItem("user")) {
       $location.path('/login');
    }
})

