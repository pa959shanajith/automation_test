mySPA.directive('tandc', function () {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: "partials/tandc.html",
        controller: ['$scope', '$filter', function ($scope, $filter) {
        }]
    }
});