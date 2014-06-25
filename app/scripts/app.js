// Sample project for visualizing JSON files.
//
//   by Keiichiro Ono
//
'use strict';

angular.module('cyViewerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'angular-underscore',
    'colorpicker.module',
    'angularSpinner'
])
    .config(function($routeProvider) {

        // Set location style.
//        $locationProvider.html5Mode(true).hashPrefix('!');
        
        // Routing
        $routeProvider
            .when('/', {
                templateUrl: 'views/top.html',
                controller: 'TopCtrl'
            })
            .when('/error', {
                templateUrl: 'views/top.html',
                controller: 'TopCtrl'
            })
            .when('/:url', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                 redirectTo: '/'
            });
    });