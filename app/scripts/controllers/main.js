/*global _ */
'use strict';

angular.module('cyViewerApp')
    .controller('MainCtrl', function ($scope, $http, $routeParams, Network, VisualStyles) {

        var NETWORK_SECTION_ID = '#network';

        var NETWORK_FILE = 'TCACycle.cyjs';
        var VISUAL_STYLE_FILE = 'kegg.json';

        var DEFAULT_VISUAL_STYLE = 'default';

        // Application global objects
        $scope.networks = {};
        $scope.visualStyles = {};
        $scope.styleNames = [];
        $scope.networkNames = [];
        $scope.currentVS = DEFAULT_VISUAL_STYLE;

        $scope.browserState = {show: true};
        $scope.overlayState = {show: true};
        $scope.bg = {color: '#FFFFFF'};

        $scope.columnNames = [];

        console.log('Network rendering start... ' + $routeParams.url);
        console.log('@@@Style3: ' + $scope.encodedStyle);
        NETWORK_FILE = $routeParams.url;

        if($scope.encodedStyle === undefined) {
            VISUAL_STYLE_FILE = 'https%3a%2f%2fdl%2edropboxusercontent%2ecom%2fu%2f161833%2fstyle%2ejson';
        } else {
            VISUAL_STYLE_FILE = $scope.encodedStyle;
            console.log('@@@Style SET: ' + VISUAL_STYLE_FILE);
        }

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

                console.log('@@@@@@$$$$$$########## ' + VISUAL_STYLE_FILE);

                VisualStyles.query({styleUrl: VISUAL_STYLE_FILE}, function(vs) {
                    console.log('$$$$$$########## ' + vs);

                    init(vs);
                    dropSupport();
                    setEventListeners();
                    $scope.cy.style().fromJson($scope.visualStyles[DEFAULT_VISUAL_STYLE].style).update();
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

            // Get column names
            var oneNode = $scope.nodes[0];
            for(var colName in oneNode.data) {
                $scope.columnNames.push(colName);
            }
        }


        function reset() {
            $scope.selectedNodes = {};
            $scope.selectedEdges = {};
        }

        /*
         Event listener setup for Cytoscape.js
         */
        function setEventListeners() {

            console.log('Event listeners##########...');
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

        $scope.toggleTableBrowser = function() {
            $scope.browserState.show = !$scope.browserState.show;
        };

        $scope.toggleOverlay = function() {
            $scope.overlayState.show = !$scope.overlayState.show;
        };

        $scope.fit = function() {
            $scope.cy.fit();
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
        var networkData = Network.get({networkUrl: NETWORK_FILE}, function () {
            angular.element(NETWORK_SECTION_ID).cytoscape(options);
        });
    });