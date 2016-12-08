/**
 * Created by mahane on 12/18/15.
 */
var tableServices = angular.module('tableServices',['ngResource']);

mainServices.factory("TableRenderer",function($http,DHIS2URL){
    var TableRenderer = {
       //count for analytics parameter
        checkForParameters:function (analyticsMetaData, nameProperty) {
            var count = 0;
    var index = 0;
            angular.forEach(analyticsMetaData, function (valueHeaders) {
                if (valueHeaders.name == nameProperty) {
                    index = count;
                }
                count++
            });
            return index;
        },
        getMetadataArray:function (analyticsObject, metadataType) {
            //determine the position of metadata in rows of values
            var index = this.checkForParameters(analyticsObject.headers, metadataType);
            var metadataArray = [];
            if (metadataType == 'dx') {
                metadataArray = analyticsObject.metaData.dx;
             } else if (metadataType == 'ou') {
                metadataArray = analyticsObject.metaData.ou;
            } else if (metadataType == 'co') {
                metadataArray = analyticsObject.metaData.co;
            } else if (metadataType == 'pe') {
                metadataArray = analyticsObject.metaData.pe;
            } else {
                metadataArray = analyticsObject.metaData[metadataType];
            }

            return metadataArray;
        },

        //preparing categories depending on selections
        //return the meaningfull array of xAxis and yAxis Items
        prepareCategories:function (analyticsObject, type) {
            var self=this;
            var structure = [];
            angular.forEach(self.getMetadataArray(analyticsObject, type), function (val) {
                structure.push({'name': analyticsObject.metaData.names[val], 'uid': val})
            });
            return structure;

        },
        getmetaDataCategories:function (analyticsObject, categories) {
            var categories = [];
            angular.forEach(analyticsObject, function (cat) {
                categories.push({"name": analyticsObject.metaData.names[cat], "catUid": cat})
            });
            return categories;
        },

        getDataValue:function (analyticsObject, xAxisType, xAxisUid, yAxisType, yAxisUid, filterType, filterUid) {
            var self=this;
            var num = 0;
            $.each(analyticsObject.rows, function (key, value) {
                if (filterType == 'none') {
                    if (value[self.checkForParameters(analyticsObject.headers, yAxisType)] == yAxisUid && value[self.checkForParameters(analyticsObject.headers, xAxisType)] == xAxisUid) {
                        num = parseFloat(value[self.checkForParameters(analyticsObject.headers, 'value')]);
                    }
                } else {
                    if (value[self.checkForParameters(analyticsObject.headers, yAxisType)] == yAxisUid && value[self.checkForParameters(analyticsObject.headers, xAxisType)] == xAxisUid && value[self.checkForParameters(analyticsObject.headers, filterType)] == filterUid) {
                        num = parseFloat(value[self.checkForParameters(analyticsObject.headers, 'value')]);
                    }
                }

            });
            return num;
        },

        getMetadataItemsTableDraw:function (analyticsObject, rowType, columnType) {
            var self=this;
            var normalTable=[];
            var tableContent=[];
             angular.forEach(self.prepareCategories(analyticsObject, columnType), function (column) {
                tableContent.push({"colName":column.name,"colUid":column.uid});
             });
             angular.forEach(self.prepareCategories(analyticsObject, rowType), function (row) {
               var dataElement = [];
                angular.forEach(self.prepareCategories(analyticsObject, columnType), function (column) {
                    var value='';
                    value= self.getDataValue(analyticsObject, columnType, column.uid, rowType, row.uid, "none", " ");

                    dataElement.push({"name": column.name, "uid": column.uid, "value": value});
                });
                 normalTable.push({"name": row.name, 'uid': row.uid, 'dataElement': dataElement});
            })
            return normalTable;


        },
        drawTableWithTwoRowDimension:function (analyticsObject, rowType, columnType, subcolumnType) {
            var subcolumnsLength = this.prepareCategories(analyticsObject, subcolumnType).length;
            var self=this;
            var normalTable=[];
            var tableContent=[];
             angular.forEach(self.prepareCategories(analyticsObject, columnType), function (columnName) {
                angular.forEach(self.prepareCategories(analyticsObject, subcolumnType), function (subColName) {
                });

            });
            angular.forEach(self.prepareCategories(analyticsObject, rowType), function (rowName) {
                 var dataElement = [];
                angular.forEach(self.prepareCategories(analyticsObject, columnType), function (columnName) {
                  angular.forEach(self.prepareCategories(analyticsObject, subcolumnType), function (subColName) {
                      var value='';
                      value=self.getDataValue(analyticsObject, columnType, columnName.uid, rowType, rowName.uid, subcolumnType, subColName.uid);
                      dataElement.push({"name": subColName.name, "uid": subColName.uid, "value": value});
                    });

                });
                normalTable.push({"name": rowName.name, 'uid': rowName.uid, 'dataElement': dataElement});
            });
           return normalTable;
        },

     drawTableWithTwoColumnDimension:function (analyticsObject, rowType, columnType, subrowType) {
            var subrowsLength = this.prepareCategories(analyticsObject, subrowType).length+1;
            var self=this;
            var normalTable=[];
            angular.forEach(self.prepareCategories(analyticsObject, rowType), function (rowName) {
               angular.forEach(self.prepareCategories(analyticsObject, subrowType), function (subRowName) {
                    var dataElement = [];
                   angular.forEach(self.prepareCategories(analyticsObject, columnType), function (columnName) {
                        var value='';
                        value=self.getDataValue(analyticsObject, columnType, columnName.uid, rowType, rowName.uid, subrowType, subRowName.uid);
                        dataElement.push({"name": columnName.name, "uid": columnName.uid, "value": value});
                    });
                    normalTable.push({"name": subRowName.name, 'uid': subRowName.uid, 'dataElement': dataElement});
                });

            });
        return normalTable;
        },
        drawTableHeaderWithNormal:function(analyticsObject,columnType,subcolumnType){
            var self=this;
            var subcolumnsLength = self.prepareCategories(analyticsObject, subcolumnType).length;
            var headerArray=[]
            angular.forEach(self.getMetadataArray(analyticsObject,columnType),function(header){
                headerArray.push({"name":analyticsObject.metaData.names[header],"id":header,"length":subcolumnsLength});
            });
            return headerArray;
          },
        drawTableWithTwoHeader:function(analyticsObject,columnType,subcolumnType){
            var self=this;
            var subcolumnsLength = self.prepareCategories(analyticsObject, subcolumnType).length;
            var subColumn=[];
            angular.forEach(self.prepareCategories(analyticsObject, columnType), function (columnName) {
                angular.forEach(self.prepareCategories(analyticsObject, subcolumnType), function (subColName) {
                    subColumn.push({"name":subColName.name,"uid":subColName.uid,"length":subcolumnsLength,"parentCol":columnName.name});
                });
            });
            return subColumn;
          },
        drawTableWithSingleRowDimension:function(analyticsObject,rowType,subRowType){
            var self=this;
            var subrowsLength = self.prepareCategories(analyticsObject, subRowType).length;
            var firstRows=[];
            angular.forEach(self.prepareCategories(analyticsObject, rowType), function (rowName) {
                firstRows.push({"name":rowName.name,"uid":rowName.uid,"length":subrowsLength});
            });
             return firstRows;
        }
    }
    return TableRenderer;
 });

