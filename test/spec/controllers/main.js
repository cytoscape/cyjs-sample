'use strict';

describe('Controller: MainCtrl', function () {

    // load the controller's module
    beforeEach(module('cyViewerApp'));

    var MainCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
            $scope: scope
        });
    }));

    it('should attach a list of awesomeThings to the scope', function () {
        console.log(scope);
        expect(scope.networkNames.length).toBe(0);
    });
});
