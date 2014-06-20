'use strict';

angular.module('cyViewerApp')
    .controller('TopCtrl', function($scope, $http, $location) {

        console.log('TOP controller called.=================');
        $scope.visualize = function(networkUrl, styleUrl) {
            console.log('NET ================= ' + networkUrl);
            console.log('STYLE ================= ' + styleUrl);
            $location.path('/view');
        };

    });