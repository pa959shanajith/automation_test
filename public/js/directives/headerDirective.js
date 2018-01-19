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

mySPA.directive('chatbot', function () {
    return {
        restrict: 'A', // "A" - attr
        replace: true,
        templateUrl: "partials/chatbot.html"
        // controller: ['$scope', '$filter', function ($scope, $filter) {
            
        // }]
    }
});