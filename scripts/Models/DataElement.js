/**
 * Created by kelvin on 7/25/16.
 */
var DataElementModule = angular.module('DataElementModule',[])
DataElementModule.factory('DataElement', ['$http', function($http) {
    function DataElement(dataelementData) {
        if (dataelementData) {
            this.setData(dataelementData);
        }
        // Some other initializations related to book
    }
    DataElement.prototype = {
        setData: function(dataelementData) {
            angular.extend(this, dataelementData);
        },
        isAvailable: function() {

        }
    };
    return DataElement;
}]);