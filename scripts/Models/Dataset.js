/**
 * Created by kelvin on 7/25/16.
 */
var DatasetModule = angular.module('DatasetModule',[])
DatasetModule.factory('DatasetGroup', ['$http', function($http) {
    function Dataset(datasetData) {
        if (datasetData) {
            this.setData(datasetData);
        }
        // Some other initializations related to book
    }
    Dataset.prototype = {
        setData: function(datasetData) {
            angular.extend(this, datasetData);
        },
        isAvailable: function() {

        }
    };
    return Dataset;
}]);