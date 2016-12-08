/**
 * Created by kelvin on 7/25/16.
 */
var IndicatorGroupModule = angular.module('IndicatorGroupModule',[])
IndicatorGroupModule.factory('IndicatorGroup', ['$http', function($http) {
    function IndicatorGroup(indicatorGroupData) {
        if (indicatorGroupData) {
            this.setData(indicatorGroupData);
        }
        // Some other initializations related to book
    }
    IndicatorGroup.prototype = {
        setData: function(indicatorGroupData) {
            angular.extend(this, indicatorGroupData);
        },
        isAvailable: function() {

        }
    };
    return IndicatorGroup;
}])
    .factory('indicatorGroupManager', ['$http', '$q', 'Indicator','IndicatorGroup','indicatorManager','DHIS2URL', function($http, $q, Indicator,IndicatorGroup,indicatorManager,DHIS2URL) {
    var indicatorGroupManager = {
        /* private method shouldn't be called outside this service */
        _pool: {},
        _retrieveInstance: function(indicatorGroupId, indicatorGroupData) {
            var instance = this._pool[indicatorGroupId];

            if (instance) {
                instance.setData(indicatorGroupData);
            } else {
                instance = new IndicatorGroup(indicatorGroupData);
                this._pool[indicatorGroupId] = instance;
            }
            return instance;
        },
        _search: function(indicatorGroupId) {
            return this._pool[indicatorGroupId];
        },
        _load: function(indicatorGroupId, deferred) {
            var scope = this;
            $http.get('../../../api/indicatorGroups/' + indicatorGroupId + '.json?fields=id,name')
                .success(function(indicatorGroupData) {
                    var indicatorGroup = scope._retrieveInstance(indicatorGroupData.id, indicatorGroupData);
                    deferred.resolve(indicatorGroup);
                })
                .error(function() {
                    deferred.reject();
                });
        },
        /* Public Methods */
        /* Use this function in order to get a book instance by it's id */
        getIndicatorGroup: function(indicatorGroupId) {
            var deferred = $q.defer();
            var indicatorGroup = this._search(indicatorGroupId);
            if (indicatorGroup) {
                deferred.resolve(indicatorGroup);
            } else {
                this._load(indicatorGroupId, deferred);
            }
            return deferred.promise;
        },
        /*use this function to pull a list of indicators for a selected group*/
        getIndicatorGroupItems: function (indicatorGroupId) {
            var deferred = $q.defer();
            var indicatorGroup = this._search(indicatorGroupId);
            if (indicatorGroup.hasOwnProperty('indicators')) {
                deferred.resolve(indicatorGroup.indicators);
            } else {
                $http.get(DHIS2URL+'/api/indicatorGroups/' + indicatorGroupId + '.json?fields=indicators[id,name]')
                    .success(function(GroupIndicatorsData) {
                        var indicators = [];
                        angular.forEach(GroupIndicatorsData.indicators,function(indicator){
                            indicatorManager.setIndicator(indicator);
                            indicators.push(indicator);
                        });
                        indicatorGroup.indicators = indicators;
                        deferred.resolve(indicators);
                    })
                    .error(function() {
                        deferred.reject();
                    });
            }
            return deferred.promise;
        },
        /*use this function to pull a list of dataelements for a selected group*/
        getDataElementGroupItems: function (dataElementGroupId) {
            var deferred = $q.defer();
            var dataElementGroup = this._search(dataElementGroupId);
            if (dataElementGroup.hasOwnProperty('dataElements')) {
                deferred.resolve(dataElementGroup.dataElements);
            } else {
                $http.get(DHIS2URL+'/api/dataElementGroups/' + dataElementGroupId + '.json?fields=dataElements[id,name]')
                    .success(function(GroupDataElementsData) {
                        var dataElements = [];
                        angular.forEach(GroupDataElementsData.dataElements,function(dataElement){
                            indicatorManager.setIndicator(dataElement);
                            dataElements.push(dataElement);
                        });
                        dataElementGroup.dataElements = dataElements;
                        deferred.resolve(dataElements);
                    })
                    .error(function() {
                        deferred.reject();
                    });
            }
            return deferred.promise;
        },
        /* Use this function in order to get instances of all the indicator groups */
        loadAllIndicatorGroup: function() {
            var deferred = $q.defer();
            var scope = this;
            $http.get(DHIS2URL + '/api/indicatorGroups.json?fields=id,name&paging=false')
                .success(function(indicatorArray) {
                    var indicatorGroups = [];
                    indicatorArray.indicatorGroups.forEach(function(indicatorGroupData) {
                        var indicatorGroup = scope._retrieveInstance(indicatorGroupData.id, indicatorGroupData);
                        indicatorGroups.push(indicatorGroup);
                    });

                    deferred.resolve(indicatorGroups);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        /* Use this function in order to get instances of all the data element groups */
        loadAllDataElementGroup: function() {
            var deferred = $q.defer();
            var scope = this;
            $http.get(DHIS2URL + '/api/dataElementGroups.json?fields=id,name&paging=false')
                .success(function(dataElementArray) {
                    var dataElementGroups = [];
                    dataElementArray.dataElementGroups.forEach(function(dataElementGroupData) {
                        var dataElementGroup = scope._retrieveInstance(dataElementGroupData.id, dataElementGroupData);
                        dataElementGroups.push(dataElementGroup);
                    });

                    deferred.resolve(dataElementGroups);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        /* Use this function in order to get instances of all the data element groups */
        loadAlldataSet: function() {
            var deferred = $q.defer();
            var scope = this;
            $http.get(DHIS2URL + '/api/dataSets.json?fields=id,name&paging=false')
                .success(function(dataElementArray) {
                    var dataSets = [];
                    dataElementArray.dataSets.forEach(function(dataSetData) {
                        var dataSet = scope._retrieveInstance(dataSetData.id, dataSetData);
                        dataSets.push(dataSet);
                    });

                    deferred.resolve(dataSets);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        /*  This function is useful when we got somehow the book data and we wish to store it or update the pool and get a book instance in return */
        setIndicatorGroup: function(indicatorGroupData) {
            var scope = this;
            var indicatorGroup = this._search(indicatorGroupData.id);
            if (indicatorGroup) {
                indicatorGroup.setData(indicatorGroupData);
            } else {
                indicatorGroup = scope._retrieveInstance(indicatorGroupData);
            }
            return indicatorGroup;
        }

    };
    return indicatorGroupManager;
}]);