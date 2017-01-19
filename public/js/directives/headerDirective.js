/**
 * 
 */

mySPA.directive('header', function () {
    return {
        restrict: 'A', // "A" - attr
        replace: true,
        templateUrl: "partials/header.html"
        // controller: ['$scope', '$filter', function ($scope, $filter) {
            
        // }]
    }
});