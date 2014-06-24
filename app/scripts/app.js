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
    'colorpicker.module'
])
    .config(function($routeProvider, $locationProvider) {

        // Set location style.
        $locationProvider.html5Mode(true).hashPrefix('!');
        
        // Routing
        $routeProvider
            .when('/', {
                templateUrl: 'views/top.html',
                controller: 'TopCtrl'
            })
            .when('/:url', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            });
            // .otherwise({
            //     redirectTo: '/'
            // });
    });