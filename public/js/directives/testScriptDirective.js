// mySPA.directive('testcasetemplate', function ($compile) {
//     return {
//         restrict: 'A', 
//         replace: true,
//         templateUrl: "partials/testcasetemplate.html"
//     }
// });
mySPA.directive('testcasetemplate', function ($compile,$templateRequest) {
    return {
        link: function(scope, element){
            $templateRequest("partials/testcasetemplate.html").then(function(html){
               var template = angular.element(html);
               element.append(template);
               $compile(template)(scope);
            });
        }
    }
});


