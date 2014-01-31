/*global _ */
'use strict';

angular.module('cyViewerApp')
    .controller('MainCtrl', function ($scope, $http, Network, VisualStyles) {

        var NETWORK_SECTION_ID = '#network';

        var NETWORK_FILE = 'ps1.cyjs';
        var VISUAL_STYLE_FILE = 'ps1.json';

        var DEFAULT_VISUAL_STYLE = 'hallmarksOfCancer';

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

                VisualStyles.query({filename: VISUAL_STYLE_FILE}, function(vs) {

                    init(vs);
                    $scope.cy.style().fromJson($scope.visualStyles[DEFAULT_VISUAL_STYLE].style).update();
                    dropSupport();
                    setEventListeners();
                });
            }
        };


        function dropSupport() {
            var dropZone = angular.element(NETWORK_SECTION_ID);
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
                    var networkName = 'Unknown';
                    // Check data section is available or not.
                    var networkData = network.data;
                    if (networkData !== undefined) {
                        if (networkData.name !== undefined) {
                            networkName = networkData.name;
                        }
                    }

                    console.log($scope.networkNames);

                    while (_.contains($scope.networkNames, networkName)) {
                        networkName = networkName + '*';
                    }

                    $scope.$apply(function () {
                        $scope.networks[networkName] = network;
                        $scope.networkNames.push(networkName);
                        $scope.currentNetwork = networkName;
                        console.log($scope.networkNames);
                    });
                    $scope.cy.load(network.elements);
                    reset();
                };
                reader.readAsText(networkFile);
            });
        }

        function init(vs) {
            $scope.nodes = networkData.elements.nodes;
            initVisualStyleCombobox(vs);
            // Set network name
            var networkName = networkData.data.name;
            $scope.currentNetwork = networkData.data.name;
            $scope.networks[networkName] = networkData;
            $scope.networkNames.push(networkName);
        }


        function reset() {
            $scope.selectedNodes = {};
            $scope.selectedEdges = {};
        }

        /*
         Event listener setup for Cytoscape.js
         */
        function setEventListeners() {

            $scope.selectedNodes = {};
            $scope.selectedEdges = {};

            // Node selection
            $scope.cy.on('select', 'node', function (event) {
                var id = event.cyTarget.id();
                $scope.$apply(function () {
                    $scope.selectedNodes[id] = event.cyTarget;
                });
            });
            $scope.cy.on('select', 'edge', function (event) {
                var id = event.cyTarget.id();
                $scope.$apply(function () {
                    $scope.selectedEdges[id] = event.cyTarget;
                });
            });

            // Reset selection
            $scope.cy.on('unselect', 'node', function (event) {
                var id = event.cyTarget.id();
                $scope.$apply(function () {
                    delete $scope.selectedNodes[id];
                });
            });
            $scope.cy.on('unselect', 'edge', function (event) {
                var id = event.cyTarget.id();
                $scope.$apply(function () {
                    delete $scope.selectedEdges[id];
                });
            });
        }

        function initVisualStyleCombobox(vs) {
            _.each(vs, function (visualStyle) {
                $scope.visualStyles[visualStyle.title] = visualStyle;
            });
        }

        $scope.switchNetwork = function (networkName) {
            $scope.currentNetwork = networkName;
            var network = $scope.networks[networkName];
            $scope.cy.load(network.elements);
            reset();
        };


        //
        // Apply Visual Style
        //
        $scope.switchVS = function (vsName) {
            // Apply Visual Style
            $scope.cy.style().fromJson($scope.visualStyles[vsName].style).update();
            // Set current title
            $scope.currentVS = vsName;
        };


        // Start loading...
        var networkData = Network.get({filename: NETWORK_FILE}, function () {
            angular.element(NETWORK_SECTION_ID).cytoscape(options);
        });
    });