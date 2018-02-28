mySPA.directive('footer', function () {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: "partials/footer.html",
        controller: ['$scope', '$filter', function ($scope, $filter) {
        }]
    }
});