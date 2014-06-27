/**
 *
 * Created by kono on 2014/06/26.
 */

'use strict';

angular.module('cyViewerApp')
    .factory('Gist', ['$resource', function ($resource) {
        return $resource('/gists/:gistId');
    }]
);
