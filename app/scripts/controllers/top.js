'use strict';

angular.module('cyViewerApp')
    .controller('TopCtrl', function($scope, $rootScope, $http, $location) {

        $scope.visualize = function(networkUrl, styleUrl) {
            console.log('NET ================= ' + networkUrl);
            var encodedNetworkUrl = encodeURIComponent(networkUrl);

            // Validation


            if(!styleUrl) {
                console.log('STYLE UNDEF ================= ' + styleUrl);
            } else {
                $rootScope.encodedStyle = encodeURIComponent(styleUrl);
            }
            $location.path('/' + encodedNetworkUrl);
        };
    });