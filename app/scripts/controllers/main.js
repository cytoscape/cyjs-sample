'use strict';

angular.module('cyViewerApp')
    .controller('MainCtrl', function ($scope, $http, Network, VisualStyles) {

        var NETWORK_FILE = 'gal.cyjs';
        var VISUAL_STYLE_FILE = 'galVS.json';

        var DEFAULT_VISUAL_STYLE = 'default';

        // Application global objects
        $scope.networks = {};
        $scope.visualStyles = {};
        $scope.styleNames = [];
        $scope.networkNames = [];
        $scope.currentVS = DEFAULT_VISUAL_STYLE;

        console.log('Network rendering start...');

        // Basic settings for the Cytoscape window
        var options = {

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
                dropSupport();
                setEventListeners();
            }
        };


        function dropSupport() {
            var dropZone = angular.element('#network');
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
                    if(networkName === undefined) {
                        networkName = 'Unknown';
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

        function init() {
            $scope.nodes = networkData.elements.nodes;
            initVisualStyleCombobox();
            // Set network name
            var networkName = networkData.data.name;
            $scope.currentNetwork = networkData.data.name;
            $scope.networks[networkName] = networkData;
            $scope.networkNames.push(networkName);
        }


        /*
            Event listener setup for Cytoscape.js
         */
        function setEventListeners() {

            $scope.selectedNodes = {};
            $scope.selectedEdges= {};

            // Node selection
            $scope.cy.on('select', 'node', function(event) {
                var id = event.cyTarget.id();
                $scope.$apply(function() {
                    $scope.selectedNodes[id] = event.cyTarget;
                });
            });
            $scope.cy.on('select', 'edge', function(event) {
                var id = event.cyTarget.id();
                $scope.$apply(function() {
                    $scope.selectedEdges[id] = event.cyTarget;
                });
            });

            // Reset selection
            $scope.cy.on('unselect', 'node', function(event) {
                var id = event.cyTarget.id();
                $scope.$apply(function() {
                    delete $scope.selectedNodes[id];
                });
            });
            $scope.cy.on('unselect', 'edge', function(event) {
                var id = event.cyTarget.id();
                $scope.$apply(function() {
                    delete $scope.selectedEdges[id];
                });
            });
        }

        function initVisualStyleCombobox() {
            var styleNames = [];
            for (var i = 0; i < vs.length; i++) {
                var visualStyle = vs[i];
                var title = visualStyle.title;
                styleNames[i] = title;
                $scope.visualStyles[title] = visualStyle;
                $scope.styleNames[i] = title;
            }
        }

        $scope.switchNetwork = function(networkName) {
            $scope.currentNetwork = networkName;
            var network = $scope.networks[networkName];
            $scope.cy.load(network.elements);
        };

        //
        // Apply Visual Style
        //
        $scope.switchVS = function(vsName) {
            // Apply Visual Style
            $scope.cy.style().fromJson($scope.visualStyles[vsName].style).update();
            // Set current title
            $scope.currentVS = vsName;
        };



        // Start loading...
        var vs = VisualStyles.query({filename: VISUAL_STYLE_FILE});
        var networkData = Network.get({filename: NETWORK_FILE}, function () {
                angular.element('#network').cytoscape(options);
                init();
            });
    });