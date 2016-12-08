var dashboardController  = angular.module('dashboardController',[]);
dashboardController.controller('DashboardController',['$scope','$resource','dashboardsManager','dashboardItemsManager',
    '$routeParams','$timeout','$translate','Paginator','ContextMenuSelectedItem',
    '$filter','$http','CustomFormService','DHIS2URL', 'olHelpers',
    'olData','mapManager','chartsManager','TableRenderer','filtersManager','$localStorage','$sessionStorage','$q',function($scope,
                                                        $resource,
                                                        dashboardsManager,
                                                        dashboardItemsManager,
                                                        $routeParams,
                                                        $timeout,
                                                        $translate,
                                                        Paginator,
                                                        ContextMenuSelectedItem,
                                                        $filter,
                                                        $http,
                                                        CustomFormService,
                                                        DHIS2URL,
                                                        olHelpers,
                                                        olData,
                                                        mapManager,
                                                        chartsManager,
                                                        TableRenderer,
                                                        filtersManager,$localStorage,
                                                        $sessionStorage,
                                                        $q

    ){

        $scope.loading = true;
        //placeholder for card chart
        $scope.dashboardChart = [];
        //placaholder for dashboard dataElement
        $scope.dashboardDataElements = [];
        //placeholder for the analytics object to prevent multiple loading
        $scope.dashboardAnalytics = [];
        //placeholder for loading status of dashoard[TRUE,FALSE]
        $scope.dashboardLoader = [];
        //placeholder for failed loading of dashboard loading status of dashoard[TRUE,FALSE]
        $scope.dashboardFailLoad = [];
        //placeholder to cary the type of chart for specific dashboard[bar,column,pie,line,area,stacked,spider,map]
        $scope.dashboardChartType = [];
        //placeholder to specify if type of chart is not supported by angular chart plugin
        $scope.showOtherCharts = [];
        $scope.dashboardTab = [];
        $scope.headers = [];
        $scope.firstColumn = [];
        $scope.dataElements=[];
        $scope.indicators=[];
        $scope.datasets=[];
        $scope.secondColumn = [];
        $scope.tableDimension = [];
        $scope.tableRowDimension = [];
        $scope.tableOneDimensionBoth = [];
        $scope.icons = filtersManager.icons;
        $scope.multiPeriod = true;

        var d = new Date();
        //default filter values
        $scope.yearValue = d.getFullYear();
        $scope.periodType = "Yearly";
        $scope.radioValue = 'all';
        $scope.tableColumn = 'ou';
        $scope.tableRow = 'dx';
        $scope.chartXAxis = 'ou';
        $scope.chartYAxis = 'dx';

        //Update currently selected dashboard
        $scope.$storage = $localStorage;
        $http.get('../../../api/me/user-account.json').success(function(userAccount){
            $scope.currentUser=userAccount;
            $localStorage['dashboard.current.'+$scope.currentUser.username]=$routeParams.dashboardid;
            console.log('SAVING A LANDING PAGE:'+'dashboard.current.'+$scope.currentUser.username);
        }).error(function(errorMessage){
            //Do nothing when ajax fails
            console.log(errorMessage);
            console.log('SHIT HAPPENED COULDNT SAVE LANDING PAGE');
        });

        /**
         *
         * Filters Specification
         */
        $scope.popover = {title: 'Title', content: 'Hello Popover<br />This is a multiline message!'};


        $scope.data = [];
        $scope.loadOrgunits = false;
        filtersManager.getOrgUnits().then(function(data){
            $scope.data.orgUnitTree = filtersManager.getOtgunitTree(data);
            $scope.loadOrgunits = true;
        });
        filtersManager.getOrgUnitsLevels().then(function(data){
            $scope.data.orgUnitLevels = filtersManager.orderOrgUnitLevels(data.organisationUnitLevels);
         });
        filtersManager.getOrgUnitsGroups().then(function(data){
            $scope.data.orgUnitGroups = filtersManager.orderOrgUnitGroups(data.organisationUnitGroups);
         });
        $scope.linkValue = 'organisation';
        $scope.userOrgUnits=[];
        $scope.activateDropDown=function(linkValue){
            $scope.linkValue=linkValue;

        };
        $scope.changeOrgUnit=function(type,dashboardItem){
            $scope.linkValue=type;
            dashboardItem.orgUnitType=type;
        };
        $scope.userOrgUnits=[
            {name:'User org unit',value:'USER_ORGUNIT',padding:"10px"},
            {name:'User sub Units',value:'USER_ORGUNIT_CHILDREN',padding:0},
            {name:'User sub-x2-units',value:'USER_ORGUNIT_GRANDCHILDREN',padding:0}
        ];
        $scope.userOrgUnitsToCards=[
            {name:'User org unit',value:'USER_ORGUNIT',padding:"10px"},
            {name:'User sub Units',value:'USER_ORGUNIT_CHILDREN',padding:0},
            {name:'User sub-x2-units',value:'USER_ORGUNIT_GRANDCHILDREN',padding:0}
        ];
        $scope.selectOnly1Or3 = function(item, selectedItems) {
            if (selectedItems  !== undefined && selectedItems.length >= 20) {
                return false;
            } else {
                return true;
            }
        };

        $scope.selectOnly1Or3 = function(item, selectedItems) {
            if (selectedItems  !== undefined && selectedItems.length >=12) {
                return false;
            } else {
                return true;
            }
        };
        $scope.hoverIn = function(){
            this.hoverEdit = true;
        };

        $scope.hoverOut = function(){
            this.hoverEdit = false;
        };
        $scope.mute = [];
        $scope.activateLink = function(linkValue){
            $scope.linkValue = linkValue;
            $scope.mute[linkValue] = !$scope.mute[linkValue];

         }
        $scope.mutes = [];
        $scope.activateLinkInd = function(linkValued){
            $scope.linkValued = linkValued;
            $scope.mutes[linkValued] = !$scope.mutes[linkValued];

         }
        $scope.filtersHidden = true;
        $scope.hideFilters = function(){
            if($scope.filtersHidden == true){
                $scope.filtersHidden = false
            }else if($scope.filtersHidden == false){
                $scope.filtersHidden = true
            }
        }

        $scope.changePeriodType = function(type,dashboardItem){

            if(dashboardItem){

                dashboardItem.periodType = type;
                if(type.indexOf("Relative") > -1){
                    dashboardItem.multiPeriod = false;
                }else{
                    dashboardItem.multiPeriod = true;
                }
                $scope.getPeriodArray(type,dashboardItem);
            }else{
                $scope.periodType = type;
                if(type.indexOf("Relative") > -1){
                    $scope.multiPeriod = false;
                }else{
                    $scope.multiPeriod = true;
                }
                $scope.getPeriodArray(type);
            }

        };

        //add year by one
        $scope.nextYear = function (dashboardItem) {
            if(dashboardItem){
                dashboardItem.yearValue = parseInt(dashboardItem.yearValue) + 1;
                $scope.getPeriodArray(dashboardItem.periodType);
            }else{
                $scope.yearValue = parseInt($scope.yearValue) + 1;
                $scope.getPeriodArray($scope.periodType);
            }

        }
        //reduce year by one
        $scope.previousYear = function (dashboardItem) {
            if(dashboardItem){
                dashboardItem.yearValue = parseInt(dashboardItem.yearValue) - 1;
                $scope.getPeriodArray(dashboardItem.periodType,dashboardItem);
            }else{
                $scope.yearValue = parseInt($scope.yearValue) - 1;
                $scope.getPeriodArray($scope.periodType);
            }
        }

        //popup model
        $scope.openModel = function (size) {
            $('#'+size).modal('show');
            $scope.$broadcast('highchartsng.reflow');
        };



        $scope.getPeriodArray = function(type,dashboardItem){
            if(dashboardItem){
                var year = dashboardItem.yearValue;
                dashboardItem.dataperiods = filtersManager.getPeriodArray(type,year);
            }else{
                var year = $scope.yearValue;
                $scope.periods = filtersManager.getPeriodArray(type,year);
            }

        };
        $scope.getPeriodArray($scope.periodType);

        //abstract dashboard name
        $scope.getDashboardName = function(dashboard){
            console.log('RECEIVED DASHBOARD:');
            console.log(dashboard);
            var name = "";
            if(dashboard.type == "REPORT_TABLE"){
                name = angular.isDefined(dashboard.reportTable.displayName) ? dashboard.reportTable.displayName : dashboard.reportTable.name;
            }if(dashboard.type == "CHART"){
                name = angular.isDefined(dashboard.chart.displayName) ? dashboard.chart.displayName : dashboard.chart.name;
            }if(dashboard.type == "MAP"){
                name = angular.isDefined(dashboard.map.displayName) ? dashboard.map.displayName : dashboard.map.name;
            }if(dashboard.type == "EVENT_REPORT"){
                name = angular.isDefined(dashboard.eventReport.displayName) ? dashboard.eventReport.displayName : dashboard.eventReport.name;
            }if(dashboard.type == "EVENT_CHART"){
                name = angular.isDefined(dashboard.eventChart.displayName) ? dashboard.eventChart.displayName : dashboard.eventChart.name;
            }
            return name;
        };

        $scope.promises = [];

        $scope.column=[];
        $scope.firstRow=[];
        $scope.subRow=[];
        dashboardsManager.getDashboard($routeParams.dashboardid).then(function(dashboard){
            $scope.dashBoardName = dashboard.name;
            $scope.dashboardItems = dashboard.dashboardItems;
           angular.forEach($scope.dashboardItems,function(dashboardItem){
               //Force normal size for Messages/Reports/Resources/Users
               if( dashboardItem.type=="MESSAGES"
                   || dashboardItem.type=="REPORTS"
                   || dashboardItem.type=="RESOURCES"
                   || dashboardItem.type=="USERS"
               ) {
                   dashboardItem.shape="NORMAL";
               }
               dashboardItem.yearValue = $scope.yearValue;
               dashboardItem.periodType = 'Yearly';
                $scope.getPeriodArray(dashboardItem.periodType,dashboardItem);
               dashboardItem.name = $scope.getDashboardName(dashboardItem);
               dashboardItem.column_size = $scope.getColumnSize(dashboardItem.shape);
                $scope.getAnalytics(dashboardItem, 608, false )

               dashboardItem.labelCard=$scope.getCardSize(dashboardItem.shape);
            });
            if(dashboard.dashboardItems.length==0){

                $scope.dashboardEmpty="DashboardItem is Empty,To populate dashboard items use the main dashboard."
                $scope.dashboardInstr="Enjoy interactive dashboard by switching,filtering and changing layout to different visualization charts and table as well as GIS"
            }
            $scope.loading=false;
        });
        //$scope.column_size

        $scope.getColumnSize = function(sizeName){
            var size=12;//Default size
            if(angular.lowercase(sizeName)=="double_width") {
                size=8;
            }else if(angular.lowercase(sizeName)=="full_width"){
                size=12;
            }else if(angular.lowercase(sizeName)=="normal") {
                size=4;
            }
            return 'col-md-'+size;
        };

        $scope.cardClassResizable=function(dashboardItem){
            if(dashboardItem.column_size == 'col-md-8'){
                dashboardItem.column_size = 'col-md-12';
            }else if(dashboardItem.column_size == 'col-md-12'){
                dashboardItem.column_size = 'col-md-4';
            }else if(dashboardItem.column_size == 'col-md-4'){
                dashboardItem.column_size = 'col-md-8';
            }

            if(dashboardItem.type=='CHART'){
                var chartType = $scope.dashboardChartType[dashboardItem.id];
                (chartType == 'pie')?$scope.updateSingleDashboard(dashboardItem,'radar'):$scope.updateSingleDashboard(dashboardItem,'pie');
                $timeout(function() {
                    $scope.updateSingleDashboard(dashboardItem,chartType);

                },2 );

            }

        }

        $scope.getCardSize=function(shapeSize){
            var labelCard='';
            if(angular.lowercase(shapeSize)=="double_width") {
                labelCard='Medium';
            }else if(angular.lowercase(shapeSize)=="full_width"){
                labelCard='Large';
            }else if(angular.lowercase(shapeSize)=="normal") {
                labelCard='Small';
            }
            return labelCard;
         };

        $scope.getDashboardItem = function(dashboardItem) {
            return dashboardItem[dashboardItem.type];
        };

        $scope.formatEnumString = function(enumString){
            enumString = enumString.replace(/_/g,' ');
            enumString=enumString.toLowerCase();
            return enumString.substr(0,1)+enumString.replace(/(\b)([a-zA-Z])/g,
                function(firstLetter){
                    return   firstLetter.toUpperCase();
                }).replace(/ /g,'').substr(1);
        };

        function ucwords(str,force){
            str = str.replace(/\_/g,' ');
            str=force ? str.toLowerCase() : str;
            return str.replace(/(\b)([a-zA-Z])/g,
                function(firstLetter){
                    return   firstLetter.toUpperCase();
                });
        }

        //this is a very important function to get rid of chart.js
        $scope.prepareAnalytics  = function(dashboardItem){
            var url = ""; var column = ""; var row = ""; var filter = "";
            var i = 0;
            
            //Prepare dimension details (i.e. legendSet and metaData details for dynamic dimensions
            $scope.dimensionDetails={};
            $scope.dimensionDetails.metaData={};
            $scope.dimensionDetails.metaDataNames={};
            

            //Prepare legendSets for Dimensions
            $scope.dimensionDetails.legendSet={};
            //Go through all dataElementDimensions/categoryDimensions/attributeDimensions/programIndicatorDimensions
            var possibleDimensionNames=['dataElement','category','attribute','programIndicator','indicator'];
            //Check for dimensions definitions for addition of legendset
            //Deduce e.g. dataElementDimension from possibleDimensionName+'Dimensions'
            angular.forEach(possibleDimensionNames,function(possibleDimensionName){
                if(angular.isDefined(dashboardItem.object[possibleDimensionName+'Dimensions'])) {
                    angular.forEach(dashboardItem.object[possibleDimensionName+'Dimensions'],function(possibleDimension){
                        //Append Legendset if it exists
                        if(angular.isDefined(possibleDimension['legendSet'])) {
                            $scope.dimensionDetails.legendSet[ possibleDimension[possibleDimensionName].id ]= possibleDimension['legendSet'].id
                        }
                        //Prepare metadata for the dimension
                        if(possibleDimensionName=='dataElement' && angular.isDefined(possibleDimension['dataElement'])) {
                            //Construct meta-dataDimension
                            //@todo for dataElement pull attributeDimension values
                            //pull attribute options
                            $scope.promises.push($http.get('../../../api/dataElements/'+possibleDimension['dataElement'].id+'.json?fields=id,name,optionSetValue,optionSet[id,name,options[id,name,code]]')
                                .success(function(dataElementObject){
                                    $scope.dimensionDetails.metaDataNames[possibleDimension['dataElement'].id]=dataElementObject.name;
                                    $scope.dimensionDetails.metaData[possibleDimension['dataElement'].id]=[];
                                    //For dataElement of Optionset type deduce options
                                    if( dataElementObject.optionSetValue===true) {
                                        angular.forEach(dataElementObject.optionSet.options,function(option){
                                            //If filter exist only put items in the filter, else if filter doesn't exist, put it all.
                                            if(angular.isDefined(possibleDimension['filter']) && $.inArray(option.name,possibleDimension['filter'].replace(/IN:/,'').split(';'))!=0 ) {
                                                //Only place filters in the list, because filter exist
                                                $scope.dimensionDetails.metaData[possibleDimension['dataElement'].id].push(option.code);
                                                $scope.dimensionDetails.metaDataNames[option.code]=option.name;
                                                //$scope.dimensionDetails.metaDataNames[option.id]=option.name;
                                            }else if ( angular.isUndefined(possibleDimension['filter']) ) {
                                                //Place everything because filter doesn't exist
                                                $scope.dimensionDetails.metaData[possibleDimension['dataElement'].id].push(option.code);
                                                $scope.dimensionDetails.metaDataNames[option.code]=option.name;
                                                //$scope.dimensionDetails.metaDataNames[option.id]=option.name;
                                            }

                                        });
                                    }else {
                                        //For integer, pick the max-limit and deduce single digit counts as legend
                                        if(angular.isDefined(possibleDimension['filter']) && possibleDimension['filter'].search('LE')!="-1" && Number(possibleDimension['filter'].replace(/LE:/,''))!=0 ) {
                                            //Only place filters in the list, because filter exist
                                            for(i=0;i<=Number(possibleDimension['filter'].replace(/LE:/,''));i++) {

                                                $scope.dimensionDetails.metaData[possibleDimension['dataElement'].id].push(''+i+'.0');
                                                $scope.dimensionDetails.metaDataNames[''+i+'.0']=''+i+'.0';
                                                //$scope.dimensionDetails.metaDataNames[option.id]=option.name;
                                            }
                                        }else if(angular.isDefined(possibleDimension['filter']) && possibleDimension['filter'].search('GT')!="-1" && Number(possibleDimension['filter'].replace(/GT:/,''))!=0 ) {
                                            //Only place filters in the list, because filter exist
                                            //@todo learn it works and fetch max limit incase of GT filter, currently limited to only next 10
                                            var maxLimit=Number(possibleDimension['filter'].replace(/GT:/,''))+10;
                                            for(i=Number(possibleDimension['filter'].replace(/GT:/,''));i<=maxLimit;i++) {

                                                $scope.dimensionDetails.metaData[possibleDimension['dataElement'].id].push(''+i+'.0');
                                                $scope.dimensionDetails.metaDataNames[''+i+'.0']=''+i+'.0';
                                                //$scope.dimensionDetails.metaDataNames[option.id]=option.name;
                                            }
                                        }

                                    }
                                    //For dataaelement of type

                                }).error(function(errorMessage){
                                    console.log('Loading dataElement failed!');
                                    console.log(errorMessage);
                                }));

                        }else if ( possibleDimensionName=='category' && angular.isDefined(possibleDimension['category']) ) {
                            $scope.promise.push($http.get('../../../api/categories/'+possibleDimension['category'].id+'.json?fields=id,name,categoryOptions[id,name]')
                                .success(function(categoryObject){
                                    $scope.dimensionDetails.metaDataNames[possibleDimension['category'].id]=categoryObject.name;
                                    $scope.dimensionDetails.metaData[possibleDimension['category'].id]=[];
                                    angular.forEach(categoryObject.categoryOptions,function(categoryOption){
                                        $scope.dimensionDetails.metaData[possibleDimension['dataElement'].id].push(categoryOption.id);
                                        $scope.dimensionDetails.metaDataNames[categoryOption.id]=categoryOption.name;
                                    });

                                }).error(function(errorMessage){
                                    console.log('Loading dataElement failed!');
                                    console.log(errorMessage);
                                }));
                        }
                    });
                }
            });

            //prepare column
            angular.forEach(dashboardItem.object.columns,function(dashboardItemObjectColum){
                // @todo Check for filter if it exist
                var items = "";
                var dimensionPrefix="";
                //Check if legendset exist to incorporate
                if(angular.isDefined($scope.dimensionDetails.legendSet[dashboardItemObjectColum.dimension])) {
                    dimensionPrefix="-"+$scope.dimensionDetails.legendSet[dashboardItemObjectColum.dimension];
                }
                if(i == 0 ) { items += "dimension="+dashboardItemObjectColum.dimension+dimensionPrefix+':'}else{ items += "&dimension="+dashboardItemObjectColum.dimension+':' };
                angular.forEach(dashboardItemObjectColum.items,function(item){
                    items += item.id+';';
                });
                if(angular.isDefined(dashboardItemObjectColum.filter)) {
                    items += dashboardItemObjectColum.filter+';';
                }
                column += items.slice(0, -1);
                i++;
            });

            //prepare rows
            angular.forEach(dashboardItem.object.rows,function(dashboardItemObjectRow){
                // @todo Check for filter if it exist
                var items = "";
                var dimensionPrefix="";
                //Check if legendset exist to incorporate
                if(angular.isDefined($scope.dimensionDetails.legendSet[dashboardItemObjectRow.dimension])) {
                    dimensionPrefix="-"+$scope.dimensionDetails.legendSet[dashboardItemObjectRow.dimension];
                }
                items += "&dimension="+dashboardItemObjectRow.dimension+dimensionPrefix+':';
                angular.forEach(dashboardItemObjectRow.items,function(item){
                    items += item.id+';';
                });
                if(angular.isDefined(dashboardItemObjectRow.filter)) {
                    items += dashboardItemObjectRow.filter+';';
                }
                row += items.slice(0, -1);
            });
            //@todo Check if value exist

            //prepare filters
            angular.forEach(dashboardItem.object.filters,function(dashboardItemObjectFilter){
                // @todo Check for filter if it exist
                var items = "";
                var dimensionPrefix="";
                //Check if legendset exist to incorporate
                if(angular.isDefined($scope.dimensionDetails.legendSet[dashboardItemObjectFilter.dimension])) {
                    dimensionPrefix="-"+$scope.dimensionDetails.legendSet[dashboardItemObjectFilter.dimension];
                }

                items += "&dimension="+dashboardItemObjectFilter.dimension+dimensionPrefix+':';
                angular.forEach(dashboardItemObjectFilter.items,function(item){
                    items += item.id+';';
                });
                if(angular.isDefined(dashboardItemObjectFilter.filter)) {
                    items += dashboardItemObjectFilter.filter+';';
                }
                filter += items.slice(0, -1);
            });

            if( dashboardItem.type=="EVENT_CHART" ) {
                url += "../../../api/analytics/events/aggregate/"+dashboardItem.object.program.id+".json?stage=" +dashboardItem.object.programStage.id+"&";
            }else if ( dashboardItem.type=="EVENT_REPORT" ) {
                if( dashboardItem.object.dataType=="AGGREGATED_VALUES") {
                    url += "../../../api/analytics/events/aggregate/"+dashboardItem.object.program.id+".json?stage=" +dashboardItem.object.programStage.id+"&";
                }else {
                    url += "../../../api/analytics/events/query/"+dashboardItem.object.program.id+".json?stage=" +dashboardItem.object.programStage.id+"&";
                }

            }else if ( dashboardItem.type=="EVENT_MAP" ) {
                url +="../../../api/analytics/events/aggregate/"+dashboardItem.object.program.id+".json?stage="  +dashboardItem.object.programStage.id+"&";
            }else {
                url += "../../../api/analytics.json?";
            }

            url += column+row;
            ( filter == "" )? url+"" : url += filter;
            url += "&displayProperty=NAME"+  dashboardItem.type=="EVENT_CHART" ?
                    "&outputType=EVENT&"
                        : dashboardItem.type=="EVENT_REPORT" ?
                    "&outputType=EVENT&displayProperty=NAME"
                        : dashboardItem.type=="EVENT_MAP" ?
                    "&outputType=EVENT&displayProperty=NAME"
                        :"&displayProperty=NAME" ;

            return url;

        };

        $scope.getAnalytics = function( dashboardItem, width, prepend )
        {
            width = width || 408;
            prepend = prepend || false;

            var graphStyle = "width:" + width + "px; overflow:hidden;";
            var tableStyle = "width:" + width + "px;";
            var userOrgUnit =  [];
            $scope.dashboardLoader[dashboardItem.id] = true;
            //Handles Events and Aggregate Charts
            if ( dashboardItem.type=="CHART" || dashboardItem.type=="EVENT_CHART" )
            {
                $http.get('../../../api/'+$scope.formatEnumString(dashboardItem.type)+'s/'+dashboardItem[$scope.formatEnumString(dashboardItem.type)].id+'.json?fields=:all,program[id,name],programStage[id,name],columns[dimension,filter,items[id,name],legendSet[id,name]],rows[dimension,filter,items[id,name],legendSet[id,name]],filters[dimension,filter,items[id,name],legendSet[id,name]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits')
                    .success(function(dashboardItemObject){
                        dashboardItem.object=dashboardItemObject;
                        var url = $scope.prepareAnalytics(dashboardItem);
                        $http.get(url)
                            .success(function(analyticsData){
                                //Accounts for events charts without series and category pre-defined
                                if(angular.isUndefined(dashboardItem.object.category)) {
                                    //No category dimension default to first row dimension
                                    if(angular.isDefined(dashboardItem.object.rows) && dashboardItem.object.rows.length>0) {
                                        dashboardItem.object.category=dashboardItem.object.rows[0].dimension;
                                    }else {
                                        //Event report that don't have single row, uses event date as rows
                                        dashboardItem.object.category="eventdate";
                                    }
                                }
                                if(angular.isUndefined(dashboardItem.object.series)) {
                                    //No series dimension default to first column dimension
                                    if(angular.isDefined(dashboardItem.object.columns) && dashboardItem.object.columns.length>0) {
                                        dashboardItem.object.series=dashboardItem.object.columns[0].dimension;
                                    }
                                }
                                //Account for additional meta-data needed by drawing chart object for events
                                $q.all($scope.promises).then(function(promiseResults){
                                    angular.extend(analyticsData.metaData.names,$scope.dimensionDetails.metaDataNames);
                                    angular.extend(analyticsData.metaData,$scope.dimensionDetails.metaData);

                                    $scope.dashboardAnalytics[dashboardItem.id] = analyticsData;
                                    $scope.dashboardDataElements[dashboardItem.id] = chartsManager.getMetadataArray(analyticsData,'dx');
                                    var chartType=dashboardItem.object.type.toLowerCase();
                                    //setting chart service
                                    $scope.dashboardChartType[dashboardItem.id] = chartType;
                                    dashboardItem.chartXAxis = dashboardItem.object.category;
                                    dashboardItem.chartYAxis = dashboardItem.object.series;
                                    dashboardItem.chartXAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.object.category);
                                    dashboardItem.chartYAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.object.series);
                                    dashboardItem.yAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.object.series);
                                    dashboardItem.xAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.object.category);
                                    $scope.dashboardChart[dashboardItem.id] = chartsManager.drawChart(analyticsData,dashboardItem.object.category,[],dashboardItem.object.series,[],'none','',dashboardItem.object.name,chartType);
                                    $scope.dashboardLoader[dashboardItem.id] = false;
                                    $scope.dashboardFailLoad[dashboardItem.id] = false;
                                    console.log('Chart rendering variables:');
                                    console.log('dashboard item:');
                                    console.log(dashboardItem.object);
                                    console.log('analytics object:');
                                    console.log(analyticsData);
                                    console.log('category:');
                                    console.log(dashboardItem.object.category);
                                    console.log('series:');
                                    console.log(dashboardItem.object.series);
                                    console.log('object name:');
                                    console.log(dashboardItem.object.name);
                                    console.log('chart type:');
                                    console.log(chartType);
                                });

                            }).error(function(error){
                                $scope.dashboardLoader[dashboardItem.id] = false;
                                $scope.dashboardFailLoad[dashboardItem.id] = true;
                            });
                    }).error(function(error){
                        console.log(error)
                        $scope.dashboardLoader[dashboardItem.id] = false;
                        $scope.dashboardFailLoad[dashboardItem.id] = true;
                    });

            }
            //Handles Events and Aggregate Map
            else if ( dashboardItem.type=="MAP" )
            {

                $http.get('../../../api/'+$scope.formatEnumString(dashboardItem.type)+'s/'+dashboardItem[$scope.formatEnumString(dashboardItem.type)].id+'.json?fields=*,columns[dimension,filter,items[id,undefined]],rows[dimension,filter,items[id,undefined]],filters[dimension,filter,items[id,undefined]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit,mapViews[*,columns[dimension,filter,items[id,undefined]],rows[dimension,filter,items[id,undefined]],filters[dimension,filter,items[id,undefined]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit]')
                    .success(function(output){
                        var mapCenter = {zoom:5,lat:output.latitude/100000,lon:output.longitude/100000};
                        //var mapCenter = {zoom:5,lat:output.latitude,lon:output.longitude};
                        $scope.touchedFeature = {};
                        var shared = mapManager.getShared();
                        shared.facility = 3029;

                        mapManager.separateLayers(output);
                        mapManager.getOrganisationUnits();
                        mapManager.getMapLayerBoundaries(mapManager.organisationUnits,dashboardItem.id).then(function(){
                            mapManager.getMapThematicData().then(function(){
                                $scope.dashboardAnalytics[dashboardItem.id] = mapManager.analytics;
                                var mapRenderer = mapManager.renderMapLayers(mapCenter,dashboardItem.id);

                                angular.extend(dashboardItem.map,mapRenderer);
                                angular.extend(dashboardItem.map,mapManager.legendSet);

                                mapManager.registerMapEvents($scope,dashboardItem.id,function(scope){
                                    var featuredData = JSON.parse(localStorage.getItem(dashboardItem.id));
                                    $scope.touchedFeature[dashboardItem.id] = featuredData[scope.previousFeature];

                                    //$scope.$watch($scope.touchedFeature,function(newFeature,oldFeature){
                                    //
                                    //});

                                });

                                dashboardItem.map.columSize = {};
                                dashboardItem.map.columSize['col-md-4'] = "60%";
                                dashboardItem.map.columSize['col-md-8'] = "80%";
                                dashboardItem.map.columSize['col-md-12'] = "85%";

                                dashboardItem.map.columnLabelMarginLeft = {};
                                dashboardItem.map.columnLabelMarginLeft['col-md-4'] = "30%";
                                dashboardItem.map.columnLabelMarginLeft['col-md-8'] = "40%";
                                dashboardItem.map.columnLabelMarginLeft['col-md-12'] = "42.5%";

                                dashboardItem.map.title = output.name;
                                dashboardItem.map.title = output.name;
                                dashboardItem.map.styles = {
                                    fontSize:mapManager.thematicLayers[0].labelFontSize,
                                    fontStyle:mapManager.thematicLayers[0].labelFontStyle,
                                    fontColor:mapManager.thematicLayers[0].labelFontColor,
                                    fontWeight:mapManager.thematicLayers[0].labelFontWeight
                                }

                                $scope.dashboardLoader[dashboardItem.id] = false;
                                $scope.dashboardFailLoad[dashboardItem.id] = false;
                            },function(){});
                            // when map layer boundaries are successful obtained


                        },function(){
                            // when map layer boundaries fail to load

                        });
                    });

            }
            //Handles aggregate and individuala tables
            else if ( dashboardItem.type == "REPORT_TABLE" || dashboardItem.type == "EVENT_REPORT" )
            {


                $http.get('../../../api/'+$scope.formatEnumString(dashboardItem.type)+'s/'+dashboardItem[$scope.formatEnumString(dashboardItem.type)].id+'.json?fields=*,program[id,name],programStage[id,name],columns[dimension,filter,items[id,name],legendSet[id,name]],rows[dimension,filter,items[id,name],legendSet[id,name]],filters[dimension,filter,items[id,name],legendSet[id,name]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels')
                    .success(function(dashboardItemObject) {
                        dashboardItem.object = dashboardItemObject;
                        var url = $scope.prepareAnalytics(dashboardItem);
                        dashboardItem.analyticsUrl = url;
                        dashboardItem.tableName = dashboardItemObject.displayName;
                        $scope.name = dashboardItem.tableName;
                        $scope.dashboardItem = dashboardItem.tableName;
                        var column = {};
                        var rows = {};
                        var filters = {};
                        $http.get(dashboardItem.analyticsUrl)
                            .success(function(analyticsData){

                                //Account for additional meta-data needed by drawing chart object for events
                                $q.all($scope.promises).then(function(promiseResults){
                                    angular.extend(analyticsData.metaData.names,$scope.dimensionDetails.metaDataNames);
                                    angular.extend(analyticsData.metaData,$scope.dimensionDetails.metaData);

                                    $scope.dashboardDataElements[dashboardItem.id] = chartsManager.getMetadataArray(analyticsData,'dx');
                                    $scope.dashboardLoader[dashboardItem.id] = false;
                                    $scope.dashboardAnalytics[dashboardItem.id] = analyticsData;
                                    $scope.dimensions = {
                                        selected: null,
                                        axises: {"xAxis": [], "yAxis": [],"filter":[]}
                                    };
                                    angular.forEach(dashboardItem.object.rows,function(row){
                                        rows['rows']=row.dimension;
                                        $scope.dimensions.axises.xAxis.push({label:row.dimension,name:analyticsData.metaData.names[row.dimension]});
                                    });
                                    angular.forEach(dashboardItem.object.columns, function (col) {
                                        column['column'] = col.dimension;
                                        $scope.dimensions.axises.yAxis.push({label:col.dimension,name:analyticsData.metaData.names[col.dimension]});
                                    });
                                    angular.forEach(dashboardItem.object.filters,function(filter){
                                        filters['filters']=filter.dimension;
                                        $scope.dimensions.axises.filter.push({label:filter.dimension,name:analyticsData.metaData.names[filter.dimension]});
                                    });
                                    $scope.$watch('dimensions', function(dimension) {
                                        $scope.dimensionAsJson = angular.toJson(dimension, true);
                                    }, true);
                                    dashboardItem.columnLength=$scope.dimensions.axises.yAxis.length
                                    dashboardItem.rowLenth=$scope.dimensions.axises.xAxis.length
                                    dashboardItem.chartXAxis = rows.rows;
                                    dashboardItem.chartYAxis = column.column;
                                    dashboardItem.chartXAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],rows.rows);
                                    dashboardItem.chartYAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],column.column);
                                    dashboardItem.yAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],column.column);
                                    dashboardItem.xAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],rows.rows);


                                    $scope.dashboardChartType[dashboardItem.id] = 'bar';
                                    if (dashboardItem.object.columns.length == 2){
                                        $scope.tableDimension[dashboardItem.id]='2';
                                        var firstDimension=dashboardItem.object.columns[0].dimension;
                                        var secondDimension=dashboardItem.object.columns[1].dimension;
                                        $scope.firstColumn[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,firstDimension,secondDimension);
                                        $scope.secondColumn[dashboardItem.id]=TableRenderer.drawTableWithTwoHeader(analyticsData,firstDimension,secondDimension);
                                        $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoRowDimension(analyticsData,rows.rows,firstDimension,secondDimension);
                                    }else if(dashboardItem.object.rows.length == 2){
                                        $scope.tableDimension[dashboardItem.id]='3';
                                        var firstRow=dashboardItem.object.rows[0].dimension;
                                        var secondRow=dashboardItem.object.rows[1].dimension;
                                        $scope.column[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,column.column," ");
                                        $scope.firstRow[dashboardItem.id]=TableRenderer.drawTableWithSingleRowDimension(analyticsData,firstRow,secondRow);
                                        $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoColumnDimension(analyticsData,firstRow,column.column,secondRow);
                                    }else{
                                        $scope.tableDimension[dashboardItem.id]='1';
                                        $scope.headers[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,column.column," ");
                                        $scope.dashboardTab[dashboardItem.id]=TableRenderer.getMetadataItemsTableDraw(analyticsData,rows.rows,column.column);
                                    }
                                });

                            }).error(function(error){
                                $scope.dashboardLoader[dashboardItem.id] = false;
                                $scope.dashboardFailLoad[dashboardItem.id] = true;
                            });
                    }).error(function(error){
                        $scope.dashboardLoader[dashboardItem.id] = false;
                        $scope.dashboardFailLoad[dashboardItem.id] = true;
                    });

            }
        }

        //update the dashboard acording to the filters
        $scope.updateDashboard = function(){
            angular.forEach($scope.dashboardItems,function(value){
                $scope.dashboardLoader[value.id] = true;
                $scope.selectedUnits=[];$scope.selectedLevel=[];$scope.selectedGroups=[];
                if($scope.linkValue=='organisation'){
                    angular.forEach($scope.userOrgUnits,function(value){
                        if(value.selected==true){
                            $scope.selectedUnits.push({name:value.name,value:value.value,selection:'organisation'});
                        }
                    });
                $scope.orgUnitsSelected=$scope.selectedUnits;
                }else if($scope.linkValue=='levels'){
                    angular.forEach($scope.data.orOutgUnitLevels,function(value){
                        $scope.selectedLevel.push({name:value.name,value:'LEVEL-'+value.level,selection:'levels'});
                    });
                    $scope.orgUnitsSelected=$scope.selectedLevel;
                }else if($scope.linkValue=='groups'){
                    angular.forEach($scope.data.orOutgUnitGroups,function(value){
                        $scope.selectedGroups.push({name:value.name,value:'OU_GROUP-'+value.id,selection:'groups'});
                    });
                    $scope.orgUnitsSelected=$scope.selectedGroups;
                }else{
                    $scope.orgUnitsSelected=null;
                }
                var analyticsUrl = filtersManager.getAnalyticsLink($scope.data.outOrganisationUnits,$scope.data.outOrPeriods,$scope.dashboardDataElements[value.id],$scope.orgUnitsSelected);
                $http.get(analyticsUrl)
                    .success(function(analyticsData){
                        $scope.hideFilters();
                        $scope.dashboardLoader[value.id] = false;
                        $scope.dashboardFailLoad[value.id] = false;
                        $scope.dashboardAnalytics[value.id] = analyticsData;

                        //update dashboard filters
                        value.chartXAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[value.id],value.chartXAxis);
                        value.chartYAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[value.id],value.chartYAxis);
                        value.yAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[value.id],value.chartYAxis);
                        value.xAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[value.id],value.chartXAxis);
                        if(value.type == 'CHART'){
                            $scope.dashboardChart[value.id] = chartsManager.drawChart(analyticsData,value.chartXAxis,[],value.chartYAxis,[],'none','',value.object.name,$scope.dashboardChartType[value.id])

                        }else if(value.type == 'MAP'){
                            //mpande
                        }
                        else if(value.type == 'REPORT_TABLE'){
                            var columns = {};
                            var rows = {};
                            var filters = {};

                            $scope.dimensions = {
                                selected: null,
                                axises: {"xAxis": [], "yAxis": [],"filter":[]}
                            };
                            angular.forEach(value.object.rows,function(row){
                                rows['rows']=row.dimension;
                                $scope.dimensions.axises.xAxis.push({label:row.dimension,name:analyticsData.metaData.names[row.dimension]});
                            });
                            angular.forEach(value.object.columns, function (col) {
                                columns['column'] = col.dimension;
                                $scope.dimensions.axises.yAxis.push({label:col.dimension,name:analyticsData.metaData.names[col.dimension]});
                            });
                            angular.forEach(value.object.filters,function(filter){
                                filters['filters']=filter.dimension;
                                $scope.dimensions.axises.filter.push({label:filter.dimension,name:analyticsData.metaData.names[filter.dimension]});
                            });

                            $scope.$watch('dimensions', function(dimension) {
                                $scope.dimensionAsJson = angular.toJson(dimension, true);
                            }, true);
                            value.columnLength=$scope.dimensions.axises.yAxis.length
                            value.rowLenth=$scope.dimensions.axises.xAxis.length
                            if (value.object.columns.length == 2){
                                $scope.tableDimension[value.id]='2';
                                var firstDimension=value.object.columns[0].dimension;
                                var secondDimension=value.object.columns[1].dimension;
                                $scope.firstColumn[value.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,firstDimension,secondDimension);
                                $scope.secondColumn[value.id]=TableRenderer.drawTableWithTwoHeader(analyticsData,firstDimension,secondDimension);
                                $scope.dashboardTab[value.id]=TableRenderer.drawTableWithTwoRowDimension(analyticsData,rows.row,firstDimension,secondDimension);
                            }else if(value.object.rows.length == 2){
                                $scope.tableDimension[value.id]='3';
                                var firstRow=value.object.rows[0].dimension;
                                var secondRow=value.object.rows[1].dimension;
                                $scope.column[value.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,columns.column," ");
                                $scope.firstRow[value.id]=TableRenderer.drawTableWithSingleRowDimension(analyticsData,firstRow,secondRow);
                                $scope.dashboardTab[value.id]=TableRenderer.drawTableWithTwoColumnDimension(analyticsData,firstRow,columns.column,secondRow);
                            }else{
                                $scope.tableDimension[value.id]='1';
                                var row='';
                                if(typeof rows.row =='undefined'){
                                    row='ou';
                                }else{
                                    row=rows.row;
                                }
                                $scope.headers[value.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,columns.column," ");
                                $scope.dashboardTab[value.id]=TableRenderer.getMetadataItemsTableDraw(analyticsData,row,columns.column);
                            }
                        }


                    }).error(function(error){
                        $scope.dashboardLoader[value.id] = false;
                        $scope.dashboardFailLoad[value.id] = true;
                    });

            });

        };

        //update the dashboard according to the filters on a single dashboard Items
        $scope.updateFromDashboard = function(dashboardItem){
                $scope.dashboardLoader[dashboardItem.id] = true;
            $scope.selectedUnits=[];$scope.selectedLevel=[];$scope.selectedGroups=[];
            if($scope.linkValue=='organisation'){
                angular.forEach($scope.userOrgUnitsToCards,function(value){
                    if(value.selected==true){
                        $scope.selectedUnits.push({name:value.name,value:value.value,selection:'organisation'});
                    }
                });
                $scope.orgUnitsSelected=$scope.selectedUnits;
            }else if($scope.linkValue=='levels'){
                angular.forEach($scope.data.orOutgUnitLevels,function(value){
                    $scope.selectedLevel.push({name:value.name,value:'LEVEL-'+value.level,selection:'levels'});
                });
                $scope.orgUnitsSelected=$scope.selectedLevel;
            }else if($scope.linkValue=='groups'){
                angular.forEach($scope.data.orOutgUnitGroups,function(value){
                    $scope.selectedGroups.push({name:value.name,value:'OU_GROUP-'+value.id,selection:'groups'});
                });
                $scope.orgUnitsSelected=$scope.selectedGroups;
            }else{
                $scope.orgUnitsSelected=null;
            }
              var analyticsUrl = filtersManager.getAnalyticsLink(dashboardItem.outOrganisationUnits,dashboardItem.outOrPeriods,$scope.dashboardDataElements[dashboardItem.id],$scope.orgUnitsSelected);
                $http.get(analyticsUrl)
                    .success(function(analyticsData){

                        $scope.dashboardLoader[dashboardItem.id] = false;
                        $scope.dashboardFailLoad[dashboardItem.id] = false;
                        $scope.dashboardAnalytics[dashboardItem.id] = analyticsData;

                        //update dashboard filters
                        dashboardItem.chartXAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.chartXAxis);
                        dashboardItem.chartYAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.chartYAxis);
                        dashboardItem.yAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.chartYAxis);
                        dashboardItem.xAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.chartXAxis);
                        if(dashboardItem.type == 'CHART'){
                            $scope.dashboardChart[dashboardItem.id] = chartsManager.drawChart(analyticsData,dashboardItem.chartXAxis,[],dashboardItem.chartYAxis,[],'none','',dashboardItem.object.name,$scope.dashboardChartType[dashboardItem.id])

                        }else if(dashboardItem.type == 'MAP'){
                            mapManager.getOrganisationUnitsFromTree(dashboardItem.outOrganisationUnits);
                            mapManager.period = dashboardItem.outOrPeriods;
                            //mapManager.setOriginalAnalytics($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.id);

                            $scope.touchedFeature[dashboardItem.id] = {};
                            $scope.dashboardLoader[dashboardItem.id] = true;
                            $scope.dashboardFailLoad[dashboardItem.id] = false;
                            dashboardItem.type='MAP';
                            dashboardItem.map = {};
                            //mapManager.prepareMapProperties(dashboardItem);
                            mapManager.getMapLayerBoundaries(mapManager.organisationUnits,dashboardItem.id).then(function(){
                                mapManager.getMapThematicData().then(function(){
                                    localStorage.setItem(dashboardItem.id,JSON.stringify(mapManager.featuredData));
                                    //$scope.dashboardAnalytics[dashboardItem.id] = mapManager.analytics;
                                    var mapCenter = {zoom: 5, lat: -7.139309343279099, lon: 38.864305898301}; /// TODO writing a function to center map drawn from chart and table anlytic object
                                    var mapRenderer = mapManager.renderMapLayers(mapCenter,dashboardItem.id);
                                    angular.extend(dashboardItem.map,mapRenderer);
                                    angular.extend(dashboardItem.map,mapManager.legendSet);

                                    mapManager.registerMapEvents($scope,dashboardItem.id,function(scope){
                                        var featuredData = JSON.parse(localStorage.getItem(dashboardItem.id));
                                        $scope.touchedFeature[dashboardItem.id] = featuredData[scope.previousFeature];
                                        $scope.$watch($scope.touchedFeature[dashboardItem.id],function(newFeature,oldFeature){
                                        });

                                        $scope.currentDashboard = null;
                                        $scope.$on("trackDashboard",function(event,daschboard_id){
                                            $scope.currentDashboard = daschboard_id;
                                        });

                                    });

                                    dashboardItem.map.columSize = {};
                                    dashboardItem.map.columSize['col-md-4'] = "60%";
                                    dashboardItem.map.columSize['col-md-8'] = "80%";
                                    dashboardItem.map.columSize['col-md-12'] = "85%";

                                    dashboardItem.map.columnLabelMarginLeft = {};
                                    dashboardItem.map.columnLabelMarginLeft['col-md-4'] = "30%";
                                    dashboardItem.map.columnLabelMarginLeft['col-md-8'] = "40%";
                                    dashboardItem.map.columnLabelMarginLeft['col-md-12'] = "42.5%";

                                    dashboardItem.map.title = mapManager.thematicLayers[0].name;
                                    dashboardItem.map.title = mapManager.thematicLayers[0].name;
                                    dashboardItem.map.styles = {
                                        fontSize:mapManager.thematicLayers[0].labelFontSize,
                                        fontStyle:mapManager.thematicLayers[0].labelFontStyle,
                                        fontColor:mapManager.thematicLayers[0].labelFontColor,
                                        fontWeight:mapManager.thematicLayers[0].labelFontWeight
                                    }

                                    $scope.dashboardLoader[dashboardItem.id] = false;
                                    $scope.dashboardFailLoad[dashboardItem.id] = false;
                                },function(){
                                    $scope.dashboardLoader[dashboardItem.id] = false;
                                    $scope.dashboardFailLoad[dashboardItem.id] = true;
                                });
                            },function(){
                                $scope.dashboardLoader[dashboardItem.id] = false;
                                $scope.dashboardFailLoad[dashboardItem.id] = true;
                            });


                        }else if(dashboardItem.type == 'REPORT_TABLE'){
                            var columns = {};
                            var rows = {};
                            var filters = {};
                            $scope.dimensions = {
                                selected: null,
                                axises: {"xAxis": [], "yAxis": [],"filter":[]}
                            };
                            angular.forEach(dashboardItem.object.rows,function(row){
                                rows['rows']=row.dimension;
                                $scope.dimensions.axises.xAxis.push({label:row.dimension,name:analyticsData.metaData.names[row.dimension]});
                            });
                            angular.forEach(dashboardItem.object.columns, function (col) {
                                columns['column'] = col.dimension;
                                $scope.dimensions.axises.yAxis.push({label:col.dimension,name:analyticsData.metaData.names[col.dimension]});
                            });
                            angular.forEach(dashboardItem.object.filters,function(filter){
                                filters['filters']=filter.dimension;
                                $scope.dimensions.axises.filter.push({label:filter.dimension,name:analyticsData.metaData.names[filter.dimension]});
                            });

                            $scope.$watch('dimensions', function(dimension) {
                                $scope.dimensionAsJson = angular.toJson(dimension, true);
                            }, true);
                            dashboardItem.columnLength=$scope.dimensions.axises.yAxis.length
                            dashboardItem.rowLenth=$scope.dimensions.axises.xAxis.length
                            if (dashboardItem.object.columns.length == 2){
                                $scope.tableDimension[dashboardItem.id]='2';
                                var firstDimension=dashboardItem.object.columns[0].dimension;
                                var secondDimension=dashboardItem.object.columns[1].dimension;
                                $scope.firstColumn[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,firstDimension,secondDimension);
                                $scope.secondColumn[dashboardItem.id]=TableRenderer.drawTableWithTwoHeader(analyticsData,firstDimension,secondDimension);
                                $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoRowDimension(analyticsData,rows.row,firstDimension,secondDimension);
                            }else if(dashboardItem.object.rows.length == 2){
                                $scope.tableDimension[dashboardItem.id]='3';
                                var firstRow=dashboardItem.object.rows[0].dimension;
                                var secondRow=dashboardItem.object.rows[1].dimension;
                                $scope.column[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,columns.column," ");
                                $scope.firstRow[dashboardItem.id]=TableRenderer.drawTableWithSingleRowDimension(analyticsData,firstRow,secondRow);
                                $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoColumnDimension(analyticsData,firstRow,columns.column,secondRow);
                            }else{
                                $scope.tableDimension[dashboardItem.id]='1';
                                var row='';
                                if(typeof rows.row =='undefined'){
                                    row='ou';
                                }else{
                                    row=rows.row;
                                }
                                $scope.headers[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal(analyticsData,columns.column," ");
                                $scope.dashboardTab[dashboardItem.id]=TableRenderer.getMetadataItemsTableDraw(analyticsData,row,columns.column);
                            }
                        }

                    }).error(function(error){
                        $scope.dashboardLoader[dashboardItem.id] = false;
                        $scope.dashboardFailLoad[dashboardItem.id] = true;
                    });


        };



        //update the dashboard according to the filters
        $scope.updateSingleDashboard = function(dashboardItem,chartType){
            //$scope.touchedFeature[dashboardItem.id] = {name:"",value:""};
           $scope.dashboardChartType[dashboardItem.id] = chartType;
            $scope.touchedFeature = {};
            if( chartType === 'table') {
                if(mapManager.originalAnalytics.headers){
                    $scope.dashboardAnalytics[dashboardItem.id] = mapManager.getOriginalAnalytics(dashboardItem.id);
                }
                if(angular.isUndefined(dashboardItem.type)) {
                    dashboardItem.type='REPORT_TABLE';
                }
                var columns = {};
                var rows = {};
                var filters = {};
                $scope.dimensions = {
                    selected: null,
                    axises: {"xAxis": [], "yAxis": [],"filter":[]}
                };
                angular.forEach(dashboardItem.object.rows,function(row){
                    rows['rows']=row.dimension;
                    $scope.dimensions.axises.xAxis.push({label:row.dimension,name:$scope.dashboardAnalytics[dashboardItem.id].metaData.names[row.dimension]});
                });
                angular.forEach(dashboardItem.object.columns, function (col) {
                    columns['column'] = col.dimension;
                    $scope.dimensions.axises.yAxis.push({label:col.dimension,name:$scope.dashboardAnalytics[dashboardItem.id].metaData.names[col.dimension]});
                });
                angular.forEach(dashboardItem.object.filters,function(filter){
                    filters['filters']=filter.dimension;
                    $scope.dimensions.axises.filter.push({label:filter.dimension,name:$scope.dashboardAnalytics[dashboardItem.id].metaData.names[filter.dimension]});
                });
                 $scope.$watch('dimensions', function(dimension) {
                    $scope.dimensionAsJson = angular.toJson(dimension, true);
                }, true);
                dashboardItem.columnLength=$scope.dimensions.axises.yAxis.length;
                dashboardItem.rowLenth=$scope.dimensions.axises.xAxis.length;
                if (dashboardItem.object.columns.length == 2){
                    $scope.tableDimension[dashboardItem.id]='2';
                    var firstDimension=dashboardItem.object.columns[0].dimension;
                    var secondDimension=dashboardItem.object.columns[1].dimension;
                    $scope.firstColumn[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal($scope.dashboardAnalytics[dashboardItem.id],firstDimension,secondDimension);
                    $scope.secondColumn[dashboardItem.id]=TableRenderer.drawTableWithTwoHeader($scope.dashboardAnalytics[dashboardItem.id],firstDimension,secondDimension);
                    $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoRowDimension($scope.dashboardAnalytics[dashboardItem.id],rows.rows,firstDimension,secondDimension);
                }else if(dashboardItem.object.rows.length == 2){
                    $scope.tableDimension[dashboardItem.id]='3';
                    var firstRow=dashboardItem.object.rows[0].dimension;
                    var secondRow=dashboardItem.object.rows[1].dimension;
                    $scope.column[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal($scope.dashboardAnalytics[dashboardItem.id],columns.column," ");
                    $scope.firstRow[dashboardItem.id]=TableRenderer.drawTableWithSingleRowDimension($scope.dashboardAnalytics[dashboardItem.id],firstRow,secondRow);
                    $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoColumnDimension($scope.dashboardAnalytics[dashboardItem.id],firstRow,columns.column,secondRow);
                }else{

                    $scope.tableDimension[dashboardItem.id]='1';
                    $scope.headers[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal($scope.dashboardAnalytics[dashboardItem.id],columns.column," ");
                    $scope.dashboardTab[dashboardItem.id]=TableRenderer.getMetadataItemsTableDraw($scope.dashboardAnalytics[dashboardItem.id],rows.rows,columns.column);
                }
            }
            else if(chartType == 'map') {
                mapManager.setOriginalAnalytics($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.id);

                $scope.touchedFeature[dashboardItem.id] = {};
                $scope.dashboardLoader[dashboardItem.id] = true;
                $scope.dashboardFailLoad[dashboardItem.id] = false;
                dashboardItem.type='MAP';
                dashboardItem.map = {};
                mapManager.prepareMapProperties(dashboardItem);
                mapManager.getMapLayerBoundaries(mapManager.organisationUnits,dashboardItem.id).then(function(){
                mapManager.getMapThematicData().then(function(){
                    localStorage.setItem(dashboardItem.id,JSON.stringify(mapManager.featuredData));
                    //$scope.dashboardAnalytics[dashboardItem.id] = mapManager.analytics;
                    var mapCenter = {zoom: 5, lat: -7.139309343279099, lon: 38.864305898301}; /// TODO writing a function to center map drawn from chart and table anlytic object
                    var mapRenderer = mapManager.renderMapLayers(mapCenter,dashboardItem.id);
                    angular.extend(dashboardItem.map,mapRenderer);
                    angular.extend(dashboardItem.map,mapManager.legendSet);

                    mapManager.registerMapEvents($scope,dashboardItem.id,function(scope){
                        var featuredData = JSON.parse(localStorage.getItem(dashboardItem.id));
                        $scope.touchedFeature[dashboardItem.id] = featuredData[scope.previousFeature];
                        $scope.$watch($scope.touchedFeature[dashboardItem.id],function(newFeature,oldFeature){
                        });

                        $scope.currentDashboard = null;
                        $scope.$on("trackDashboard",function(event,daschboard_id){
                            $scope.currentDashboard = daschboard_id;
                        });

                    });

                    dashboardItem.map.columSize = {};
                    dashboardItem.map.columSize['col-md-4'] = "60%";
                    dashboardItem.map.columSize['col-md-8'] = "80%";
                    dashboardItem.map.columSize['col-md-12'] = "85%";

                    dashboardItem.map.columnLabelMarginLeft = {};
                    dashboardItem.map.columnLabelMarginLeft['col-md-4'] = "30%";
                    dashboardItem.map.columnLabelMarginLeft['col-md-8'] = "40%";
                    dashboardItem.map.columnLabelMarginLeft['col-md-12'] = "42.5%";

                    dashboardItem.map.title = mapManager.thematicLayers[0].name;
                    dashboardItem.map.title = mapManager.thematicLayers[0].name;
                    dashboardItem.map.styles = {
                        fontSize:mapManager.thematicLayers[0].labelFontSize,
                        fontStyle:mapManager.thematicLayers[0].labelFontStyle,
                        fontColor:mapManager.thematicLayers[0].labelFontColor,
                        fontWeight:mapManager.thematicLayers[0].labelFontWeight
                    }

                    $scope.dashboardLoader[dashboardItem.id] = false;
                    $scope.dashboardFailLoad[dashboardItem.id] = false;
                },function(){
                    $scope.dashboardLoader[dashboardItem.id] = false;
                    $scope.dashboardFailLoad[dashboardItem.id] = true;
                });
                },function(){
                    $scope.dashboardLoader[dashboardItem.id] = false;
                    $scope.dashboardFailLoad[dashboardItem.id] = true;
                });
            }else{

                if(mapManager.originalAnalytics.headers){
                    $scope.dashboardAnalytics[dashboardItem.id] = mapManager.getOriginalAnalytics(dashboardItem.id);
                }

                if(angular.isUndefined(dashboardItem.type)) {
                    dashboardItem.type='CHART';
                }
                var xItems = dashboardItem.xAxisData.map(function(a) {return a.id;});
                var yItems = dashboardItem.yAxisData.map(function(a) {return a.id;});
                $scope.dashboardLoader[dashboardItem.id] = true;
                $scope.dashboardChart[dashboardItem.id] = chartsManager.drawChart($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.chartXAxis,xItems,dashboardItem.chartYAxis,yItems,'none','',dashboardItem.object.name,chartType)
                $scope.dashboardLoader[dashboardItem.id] = false;
            }

        }

        //update the dashboard charts according to layout selection
        $scope.updateChartLayout = function(dashboardItem,chartType,xAxis,yAxis) {
            dashboardItem.chartXAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],xAxis);
            dashboardItem.chartYAxisItems = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],yAxis);
            dashboardItem.yAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],yAxis);
            dashboardItem.xAxisData       = chartsManager.getDetailedMetadataArray($scope.dashboardAnalytics[dashboardItem.id],xAxis);
            $scope.dashboardLoader[dashboardItem.id] = true;
            $scope.dashboardChart[dashboardItem.id] = chartsManager.drawChart($scope.dashboardAnalytics[dashboardItem.id], xAxis, [], yAxis, [], 'none', '', dashboardItem.object.name, chartType)
            $scope.dashboardLoader[dashboardItem.id] = false;
        }

        //update the dashboard charts according to layout selection
        $scope.updateChartDataSelection = function(dashboardItem,chartType,xAxis,yAxis,xAxisItems,yAxisItems) {
            var xItems = xAxisItems.map(function(a) {return a.id;});
            var yItems = yAxisItems.map(function(a) {return a.id;});
            $scope.dashboardLoader[dashboardItem.id] = true;
            $scope.dashboardChart[dashboardItem.id] = chartsManager.drawChart($scope.dashboardAnalytics[dashboardItem.id], xAxis, xItems, yAxis, yItems, 'none', '', dashboardItem.object.name, chartType)
            $scope.dashboardLoader[dashboardItem.id] = false;
        }
        $scope.updateTableLayout=function(dashboardItem,columns,rows){
            //@todo remvoving the dimension hard-coding limited to 3 dimensions
              dashboardItem.columnLength=columns.length
              dashboardItem.rowLenth=rows.length
            if (columns.length == 2 && rows.length==1){
                $scope.tableDimension[dashboardItem.id]=dashboardItem.columnLength;
                var firstDimension=columns[0].label;
                var secondDimension=columns[1].label;
                var rows=rows[0].label;
                $scope.firstColumn[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal($scope.dashboardAnalytics[dashboardItem.id],firstDimension,secondDimension);
                $scope.secondColumn[dashboardItem.id]=TableRenderer.drawTableWithTwoHeader($scope.dashboardAnalytics[dashboardItem.id],firstDimension,secondDimension);
                $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoRowDimension($scope.dashboardAnalytics[dashboardItem.id],rows,firstDimension,secondDimension);
            }else if(rows.length == 2 && columns.length==1){
                $scope.tableDimension[dashboardItem.id]='3';
                var firstRow=rows[0].label;
                var secondRow=rows[1].label;
                var columns=columns[0].label;
                $scope.column[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal($scope.dashboardAnalytics[dashboardItem.id],columns," ");
                $scope.firstRow[dashboardItem.id]=TableRenderer.drawTableWithSingleRowDimension($scope.dashboardAnalytics[dashboardItem.id],firstRow,secondRow);
                $scope.dashboardTab[dashboardItem.id]=TableRenderer.drawTableWithTwoColumnDimension($scope.dashboardAnalytics[dashboardItem.id],firstRow,columns,secondRow);
            }else if(rows.length == 1 && columns.length==1){
                $scope.tableDimension[dashboardItem.id]='1';
                $scope.headers[dashboardItem.id]=TableRenderer.drawTableHeaderWithNormal($scope.dashboardAnalytics[dashboardItem.id],columns[0].label," ");
                $scope.dashboardTab[dashboardItem.id]=TableRenderer.getMetadataItemsTableDraw($scope.dashboardAnalytics[dashboardItem.id],rows[0].label,columns[0].label);
            }else{
                alert("Either of the dimensions must have valid dimension");
            }
        }

        //prepare data for use in csv
        $scope.prepareDataForCSV = function(dashboardItem){
            var chartObject = chartsManager.drawChart($scope.dashboardAnalytics[dashboardItem.id],dashboardItem.chartXAxis,[],dashboardItem.chartYAxis,[],'none','',dashboardItem.object.name,'bar')
            var items = [];
            angular.forEach(chartObject.series,function(value){
                var obj = {name:value.name};
                var i = 0;
                angular.forEach(chartObject.options.xAxis.categories,function(val){
                    obj[val] = value.data[i];
                    i++;
                })
                items.push(obj);
            })
            return items;
        };
        $scope.singleDashboardDetails=function(dashboardItem,type){
            var analyticsObject=$scope.dashboardAnalytics[dashboardItem.id];
            if(type=='details'){
                dashboardItem.type='DASHBOARD_DETAILS';
                var dataElementArray=[];
                var indicatorArray=[];
                var datasetArray=[];
                angular.forEach(analyticsObject.metaData.dx,function(dxUid){
                    $scope.dashboardLoader[dashboardItem.id] = true;
                    var dataElementApi=
                        $resource('../../../api/dataElements/'+dxUid+'.json?fields=id,name,aggregationType,displayName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataSets[id,name,periodType]',{get:{method:"JSONP"}});
                    var dataelements=dataElementApi.get(function(dataElementObject){
                        dataElementArray.push(dataElementObject);
                        $scope.dataElements[dashboardItem.id]=dataElementArray;
                        $scope.dashboardLoader[dashboardItem.id] = false;
                    },function(response){
                        if(response.status==404){
                            var indicatorApi=
                                $resource('../../../api/indicators/'+dxUid+'.json?fields=id,name,numeratorDescription,denominatorDescription,denominator,numerator,indicatorType[id,name],dataSets[id,name,periodType]',{get:{method:"JSONP"}});
                            var indicators=indicatorApi.get(function(indicatorObject){
                                var expApi=
                                    $resource('../../../api/expressions/description',{get:{method:"JSONP"}});
                                var numeratorExp=expApi.get({expression:indicatorObject.numerator},function(numeratorText){
                                    var numerator=numeratorText.description;
                                    var denominatorExp=expApi.get({expression:indicatorObject.denominator},function(denominatorText){
                                    var denominator=denominatorText.description;
                                    indicatorArray.push({name:indicatorObject.name,uid:indicatorObject.id,denominatorDescription:indicatorObject.denominatorDescription,numeratorDescription:indicatorObject.numeratorDescription,numerator:numerator,denominator:denominator,indicatorType:indicatorObject.indicatorType,dataSets:indicatorObject.dataSets});
                                 $scope.indicators[dashboardItem.id]=indicatorArray;
                                        $scope.dashboardLoader[dashboardItem.id] = false;
                                });
                                });

                            },function(rensponse){
                                if(response.status===404){
                                    var datasetApi=
                                        $resource('../../../api/dataSets/'+dxUid +'.json?fields=id,name,periodType,shortName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]',{get:{method:"JSONP"}});
                                    var dataSets=datasetApi.get(function(datasetObject) {
                                        datasetArray.push(datasetObject);
                                        $scope.datasets[dashboardItem.id] =datasetArray;
                                        $scope.dashboardLoader[dashboardItem.id] = false;
                                    });
                                }

                            })
                        }

                    });
                });
            }
        }
    }]);

