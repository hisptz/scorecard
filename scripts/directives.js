'use strict';

/* Directives
* Put all directives here
*
*/

var scorecardDirectives = angular.module('scorecardDirectives', []);
scorecardDirectives.directive('targetSelect', function() {
    var controller = ['$scope',function ($scope) {
        function init() {
            $scope.items = angular.copy($scope.datasource);
        }

        init();
        $scope.onTargetSelect = function($item){
            $scope.ngTargetModel = $item.id;
        }
        $scope.data = {
            selected:[],
            multiSelectEvents: {
                "onItemSelect":$scope.onTargetSelect
            }
        };
        if($scope.ngTargetModel != ""){
            $scope.data.selected = {"id":$scope.ngTargetModel};
        }
    }];


    return {
        scope: {
            ngTargetModel: '=',
            options: '='
        },
        controller: controller,
        templateUrl: 'views/partials/target-select.html'

    };
}).directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.compile);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
        )};
}])
