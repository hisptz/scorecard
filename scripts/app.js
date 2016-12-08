
'use strict';

/* App Module */

var scorecard = angular.module('scorecard',
                    [
                        'ngRoute',
                        'ngCookies',
                        'ngSanitize',
                        'scorecardDirectives',
                        'scorecardControllers',
                        'scorecardServices',
                        'scorecardFilters',
                        'd2Services',
                        'd2Controllers',
                        'd2HeaderBar',
                        'mgcrea.ngStrap',
                        'pascalprecht.translate',
                        'ngAnimate',
                        'angular-spinkit',
                        'multi-select-tree',
                        'highcharts-ng',
                        'angularUtils.directives.dirPagination',
                        'dndLists',
                        'ngCsv',
                        'ngStorage',
                        'colorpicker.module'
                    ])
.config(['$localStorageProvider',
function ($localStorageProvider) {
    $localStorageProvider.setKeyPrefix('dhis2.');
    var scorecardSerializer = function (value) {
        // Do what you want with the value.
        return value;
    };

    var scorecardDeserializer = function (value) {
        return value;
    };

    $localStorageProvider.setSerializer(scorecardSerializer);
    $localStorageProvider.setDeserializer(scorecardDeserializer);

}])

.value('DHIS2URL', '../../..')
.config(function($translateProvider,$routeProvider,$popoverProvider) {
        angular.extend($popoverProvider.defaults, {
            animation: 'am-flip-x',
            trigger: 'hover'
        });

	$routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'MainController'
    }).when('/create', {
        templateUrl: 'views/create.html',
        controller: 'createScoreCardController'
    }).when('/show/:scorecardid', {
        templateUrl: 'views/scorecard.html',
        controller: 'viewCardController'
    }).when('/edit/:scorecardid', {
        templateUrl: 'views/edit.html',
        controller: 'editCardController'
    }).when('/dashboards/:dashboardid/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController'
    }).otherwise({
        redirectTo : '/'
    });
     
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.useLoader('i18nLoader');


})
.filter('capitalize', function() {
    return function filter(input) {
        if (input !== null) {
            return input.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    }
})
.filter('underscoreless', function() {
        return function (input) {
            return input.replace(/_/g, ' ');
        };
})
