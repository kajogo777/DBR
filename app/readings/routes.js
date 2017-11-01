(function(){
    'use strict';
    
    angular.module('readings')
    .config(RoutesConfig)

    RoutesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    function RoutesConfig($stateProvider, $urlRouterProvider){
        
        $stateProvider
            .state('readingManager', {
                url: '/readingManager',
                component: 'readingManager',
                resolve: {
                    readings: ['dataService', function(dataService){
                                return dataService.getReadings();
                            }]
                }
            })
            .state('readingAdd', {
                url: '/reading/add',
                component: 'readingEdit',
                resolve:{
                    reading: ['dataService', function(dataService){
                        return dataService.createReading();
                    }],
                    title: function(){
                        return 'Add New Reading';
                    }
                }
            })
            .state('readingEdit', {
                url: '/reading/edit/{id}',
                component: 'readingEdit',
                resolve:{
                    reading: ['dataService', '$stateParams', function(dataService, $stateParams){
                        return dataService.getReading($stateParams.id);
                    }],
                    title: function(){
                        return 'Edit Reading';
                    }
                }
            })
            .state('readingView', {
                url: '/reading/view/{id}',
                component: 'readingView',
                resolve:{
                    reading: ['dataService', '$stateParams', function(dataService, $stateParams){
                        return dataService.getReading($stateParams.id);
                    }]
                }
            })
    }
})();