'use strict';

angular.module('cyViewerApp')
    .controller('TopCtrl', function($scope, $rootScope, $http, $location) {

        $scope.advancedMenu = {show: false};

        $scope.visualize = function(networkUrl, styleUrl) {
            console.log('Network File = ' + networkUrl);
            $rootScope.networkUrl = networkUrl;
            var encodedNetworkUrl = encodeURIComponent(networkUrl);

            // Validation


            if(!styleUrl) {
                console.log('STYLE file is default: ' + styleUrl);
            } else {
                $rootScope.encodedStyle = encodeURIComponent(styleUrl);
            }
            $location.path('/' + encodedNetworkUrl);
        };

        $scope.visualizeGist = function (gistId) {
            $rootScope.gistId = gistId;
            $location.path('/gists/' + gistId);
        };

        $scope.toggleAdvancedMenu = function() {
            $scope.advancedMenu.show = !$scope.advancedMenu.show;
        };

    });
