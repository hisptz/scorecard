/**
 * Created by kelvin on 7/25/16.
 */
var app = angular.module('DataElementGroupModule',[])
app.factory('DataElementGroup', ['$http', function($http) {
    function DataElementGroup(dataelementGroupData) {
        if (dataelementGroupData) {
            this.setData(dataelementGroupData);
        }
        // Some other initializations related to book
    }
    DataElementGroup.prototype = {
        setData: function(dataelementGroupData) {
            angular.extend(this, dataelementGroupData);
        },
        isAvailable: function() {

        }
    };
    return DataElementGroup;
}]);