/*global _, angular */

angular.module('cyViewerApp')
    .controller('MainCtrl', function ($scope, $http, $location, $routeParams, Network, VisualStyles, Gist) {

        'use strict';

        var NETWORK_SECTION_ID = '#network';

        var NETWORK_FILE;
        var VISUAL_STYLE_FILE;

        var DEFAULT_VISUAL_STYLE = 'default';

        var gistId = $routeParams.id;

        // Application global objects
        $scope.networks = {};
        $scope.visualStyles = {};
        $scope.styleNames = [];
        $scope.networkNames = [];
        $scope.currentVS = DEFAULT_VISUAL_STYLE;
        $scope.currentNetworkData = null;

        $scope.browserState = {show: false};
        $scope.overlayState = {show: true};
        $scope.toolbarState = {show: true};

        $scope.bg = {color: '#FAFAFA'};

        $scope.columnNames = [];
        $scope.edgeColumnNames = [];
        $scope.networkColumnNames = [];

        $scope.currentLocation = $location.absUrl();

        console.log('GistID: ' + gistId);
        console.log('Network rendering start... ' + $routeParams.url);
        console.log('@@@Style4: ' + $scope.encodedStyle);
        console.log('@@@Style test: ' + (typeof $scope.encodedStyle));
        NETWORK_FILE = $routeParams.url;

        var styleLocation = $scope.encodedStyle;
        console.log('@@@Style get: ' + styleLocation);
        if(!styleLocation) {
            VISUAL_STYLE_FILE = 'https%3a%2f%2fdl%2edropboxusercontent%2ecom%2fu%2f161833%2fstyle%2ejson';
        } else {
            VISUAL_STYLE_FILE = $scope.encodedStyle;
            console.log('@@@Style SET4: ' + VISUAL_STYLE_FILE);
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

                VisualStyles.query({styleUrl: VISUAL_STYLE_FILE}, function(vs) {
                    init(vs);
                    dropSupport();
                    setEventListeners();
                    $scope.cy.style().fromJson($scope.visualStyles[DEFAULT_VISUAL_STYLE].style).update();
                    $scope.style = DEFAULT_VISUAL_STYLE;
                    angular.element('.loading').remove();
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
                    networkData = network.data;
                    if (networkData !== undefined) {
                        if (networkData.name !== undefined) {
                            networkName = networkData.name;
                            $scope.currentNetworkData = networkData;
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
            $scope.edges = networkData.elements.edges;
            initVisualStyleCombobox(vs);

            // Set network name
            var networkName = networkData.data.name;
            $scope.networks[networkName] = networkData;
            $scope.networkNames.push(networkName);
            $scope.currentNetwork = networkData.data.name;
            // Get column names
            setColumnNames();
        }

        function setColumnNames() {

            $scope.columnNames = [];
            $scope.edgeColumnNames = [];
            $scope.networkColumnNames = [];

            var oneNode = $scope.nodes[0];
            for(var colName in oneNode.data) {
                $scope.columnNames.push(colName);
            }
            var oneEdge = $scope.edges[0];
            for(var edgeColName in oneEdge.data) {
                $scope.edgeColumnNames.push(edgeColName);
            }
            for(var netColName in networkData.data) {
                $scope.networkColumnNames.push(netColName);
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


        $scope.toggleTableBrowser = function() {
            $scope.browserState.show = !$scope.browserState.show;
        };

        $scope.toggleOverlay = function() {
            $scope.overlayState.show = !$scope.overlayState.show;
        };

        $scope.toggleToolbar = function() {
            $scope.toolbarState.show = !$scope.toolbarState.show;
        };

        $scope.fit = function() {
            $scope.cy.fit();
        };

        $scope.shortenUrl = function() {
            var request = $http({
                method: 'post',
                url: 'https://www.googleapis.com/urlshortener/v1/url',
                data: {
                    longUrl: $scope.currentLocation
                }
            });
            // Store the data-dump of the FORM scope.
            request.success(
                function( json ) {
                    $scope.currentLocation = json.id;
                    angular.element('#shareUrl').select();

                }
            );
        };

        //
        // Apply Visual Style
        //
        $scope.switchVS = function () {
            var vsName = $scope.style;
            var vs = $scope.visualStyles[vsName].style;
            // Apply Visual Style
            $scope.cy.style().fromJson(vs).update();
            // Set current title
            $scope.currentVS = vsName;
        };

        $scope.switchNetwork = function () {
            var network = $scope.networks[$scope.currentNetwork];
            $scope.cy.load(network.elements);
            $scope.currentNetworkData = network;
            reset();
            $scope.nodes = network.elements.nodes;
            $scope.edges = network.elements.edges;
            setColumnNames();
        };

        // Start loading...
        var networkData = null;
        if(!gistId) {
            networkData = Network.get({networkUrl: NETWORK_FILE}, function () {
                angular.element(NETWORK_SECTION_ID).cytoscape(options);
                $scope.currentNetworkData = networkData;
            });
        } else {
            console.log('GIST!!!!!!!!!!!!!!!!!');
            Gist.get({gistId: gistId}, function (gistData) {
                var files = gistData.files;
                // TODO: parse first one only?
                var serializedNetwork = null;
                _.each(files, function(targetFile) {
                    serializedNetwork = targetFile.content;
                });
                networkData = JSON.parse(serializedNetwork);
                angular.element(NETWORK_SECTION_ID).cytoscape(options);
            });
        }
    });