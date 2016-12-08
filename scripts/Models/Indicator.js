/**
 * Created by kelvin on 7/25/16.
 */
var IndicatorModule = angular.module('IndicatorModule',[])
IndicatorModule.factory('Indicator', ['$http', function($http) {
    function Indicator(indicatorData) {
        if (indicatorData) {
            this.setData(indicatorData);
        }
        // Some other initializations related to book
    }
    Indicator.prototype = {
        setData: function(indicatorData) {
            angular.extend(this, indicatorData);
        },
        isAvailable: function() {

        }
    };
    return Indicator;
}])
    .factory('indicatorManager', ['$http', '$q', 'Indicator', function($http, $q, Indicator, DHIS2URL) {
    var indicatorManager = {
        /* private method shouldn't be called outside this service */
        _pool: {},
        _retrieveInstance: function(indicatorId, indicatorData) {
            var instance = this._pool[indicatorId];

            if (instance) {
                instance.setData(indicatorData);
            } else {
                instance = new Indicator(indicatorData);
                this._pool[indicatorId] = instance;
            }
            return instance;
        },
        _search: function(indicatorId) {
            return this._pool[indicatorId];
        },
        _load: function(indicatorId, deferred) {
            var scope = this;
            $http.get(DHIS2URL+'/api/indicators/' + indicatorId + '.json?fields=id,name,indicatorType[name]')
                .success(function(indicatorData) {
                    var indicator = scope._retrieveInstance(indicatorData.id, indicatorData);
                    deferred.resolve(indicator);
                })
                .error(function() {
                    deferred.reject();
                });
        },
        /* Public Methods */
        /* Use this function in order to get a book instance by it's id */
        getIndicator: function(indicatorId) {
            var deferred = $q.defer();
            var indicator = this._search(indicatorId);
            if (indicator) {
                deferred.resolve(indicator);
            } else {
                this._load(indicatorId, deferred);
            }
            return deferred.promise;
        },
        /* Use this function in order to get instances of all the books */
        loadAllIndicator: function() {
            var deferred = $q.defer();
            var scope = this;
            $http.get(DHIS2URL + '/api/indicators.json?fields=id,name,indicatorType[name]&paging=false')
                .success(function(indicatorArray) {
                    var indicators = [];
                    indicatorArray.forEach(function(indicatorData) {
                        var indicator = scope._retrieveInstance(indicatorData.id, indicatorData);
                        indicators.push(indicator);
                    });

                    deferred.resolve(indicators);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        /*  This function is useful when we got somehow the book data and we wish to store it or update the pool and get a book instance in return */
        setIndicator: function(indicatorData) {
            var scope = this;
            var indicator = this._search(indicatorData.id);
            if (indicator) {
                indicator.setData(indicatorData);
            } else {
                indicator = scope._retrieveInstance(indicatorData);
            }
            return indicator;
        }

    };
    return indicatorManager;
}]);