'use strict';

angular.module('cyViewerApp')
    .controller('TopCtrl', function($scope, $rootScope, $http, $location) {

        $scope.visualize = function(networkUrl, styleUrl) {
            console.log('NET ================= ' + networkUrl);
            console.log('STYLE ================= ' + styleUrl);
            var encodedNetworkUrl = encodeURIComponent(networkUrl);
            $rootScope.encodedStyle = encodeURIComponent(styleUrl);
            $location.path('/' + encodedNetworkUrl);
        };
    });