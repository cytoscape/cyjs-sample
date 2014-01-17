'use strict';

angular.module('cyViewerApp')
    .controller('MainCtrl', function ($scope, $http) {
        $scope.networks = [
            'Net 1',
            'Net 2',
            'Net 3'
        ];

        var NETWORK_FILE = 'data/sample1.cyjs';
        var VISUAL_STYLE_FILE = 'data/galVS.json';

        var DEFAULT_VISUAL_STYLE = 'Directed';

        console.log('Network rendering start...');

        var visualStyles = {};

        // Basic settings for the Cytoscape window
        var options = {

            showOverlay: false,
            minZoom: 0.01,
            maxZoom: 200,

            layout: {
                name: 'preset'
            },

            ready: function () {
                var cy = this;
                cy.load(networkData.elements);
                setVisualStyleCombobox(cy);
                setNetworkComboBox(cy);

                updateNetworkData(cy);
            }
        };

        function updateNetworkData(cy) {
            var dropZone = $('.network');
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
                    cy.load(network.elements);
                };
                reader.readAsText(networkFile);
            });
        }

        function setNetworkComboBox(cy) {
            var network;
            var networkSelector = $('#networks');
            for (var i = 0; i < 5; i++) {
                networkSelector.append('<option>Network ' + i + '</option>');
            }

            networkSelector.on('change', function (event) {
                var selectedNetworkName = $(this).val();
                console.log(selectedNetworkName);
            });
        }

        function setVisualStyleCombobox(cy) {
            var visualStyle;
            var visualStyleSelector = $('#vs');
            for (var i = 0; i < vs.length; i++) {
                visualStyle = vs[i];
                var title = visualStyle.title;
                visualStyles[title] = visualStyle;
                visualStyleSelector.append('<option>' + title + '</option>');
            }
            cy.style().fromJson(visualStyles[DEFAULT_VISUAL_STYLE].style).update();

            visualStyleSelector.val(DEFAULT_VISUAL_STYLE);
            visualStyleSelector.on('change', function (event) {
                var selectedVisualStyleName = $(this).val();
                console.log(selectedVisualStyleName);
                cy.style().fromJson(visualStyles[selectedVisualStyleName].style).update();
            });
        }

        var networkData = {};
        var vs = {};

        $http({method: 'GET', url: VISUAL_STYLE_FILE}).
            success(function(data) {
                vs = data;
                console.log("*********** OK!");
                console.log(vs);
                $http({method: 'GET', url: NETWORK_FILE}).
                    success(function(data) {
                        networkData = data;
                        $('#network').cytoscape(options);
                        console.log("*********** OK2!");
                        console.log(networkData);
                        initTable();
                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        function initTable() {
            $scope.nodes = networkData.elements.nodes;
            console.log("Got nodes***********************");
            console.log($scope.nodes);
        }

    });
