/**
 * Created by kono on 2014/01/24.
 */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
angular.module('cyViewerApp')
    .factory('Options', ['$scope', function ($scope) {
        return {

            showOverlay: false,
            minZoom: 0.01,
            maxZoom: 200,

            layout: {
                name: 'preset'
            },

            ready: function () {
                $scope.cy = this;
                $scope.cy.load(networkData.elements);
                $scope.cy.style().fromJson($scope.visualStyles[DEFAULT_VISUAL_STYLE].style).update();
                this.dropSupport();
            },

            dropSupport: function() {
                var dropZone = $('#network');
                dropZone.on('dragenter', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                });

                dropZone.on('dragover', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                });
                dropZone.on('drop', function (e) {
                    e.preventDefault();
                    var files = e.originalEvent.dataTransfer.files;
                    var networkFile = files[0];
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        var network = JSON.parse(evt.target.result);
                        var networkName = network.data.name;
                        console.log("NetworkName = " + networkName);
                        if(networkName === undefined) {
                            networkName = "Unknown";
                        }
                        $scope.$apply(function() {
                            $scope.networks[networkName] = network;
                            $scope.networkNames.push(networkName);
                            $scope.currentNetwork = networkName;
                            console.log($scope.networkNames);
                        });
                        $scope.cy.load(network.elements);
                    };
                    reader.readAsText(networkFile);
                });
            }
        };

    }]
);