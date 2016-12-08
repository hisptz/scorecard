/**
 * Created by kelvin on 8/7/16.
 */
var mainController  = angular.module('ViewCardController',[]);

mainController.controller('viewCardController',['$scope','$timeout','$translate','$anchorScroll','Paginator','$filter',
    '$http','$resource','CustomFormService','DHIS2URL','scoreCardManager','$routeParams','$q','filtersManager','chartsManager',function($scope,
                                                                            $timeout,
                                                                            $translate,
                                                                            $anchorScroll,
                                                                            Paginator,
                                                                            $filter,
                                                                            $http,
                                                                            $resource,
                                                                            CustomFormService,
                                                                            DHIS2URL,
                                                                            scoreCardManager,
                                                                            $routeParams,
                                                                            $q,
                                                                            filtersManager,
                                                                            chartsManager
    ){

        $scope.loading = true;
        $scope.currentSocreCard = {};
        $scope.reportDimensions = {};
        $scope.indicators_list = [];
        $scope.loading_amount = 0;
        var d = new Date();
        $scope.yearValue = d.getFullYear();
        $scope.analysisYearValue = d.getFullYear();
        $scope.periodType = "Quarterly";
        $scope.icons = filtersManager.icons;
        //loading organisation Unit
        $scope.data = [];
        $scope.loadOrgunits = false;
        filtersManager.getOrgUnits().then(function(data){
            $scope.data.orgUnitTree = filtersManager.getOtgunitTree(data);
            $scope.data.analysisOrgUnitTree = filtersManager.getOtgunitTree(data);
            $scope.updateScoreCard();
            $scope.loadOrgunits = true;
        });

        //loading period settings
        $scope.getPeriodArray = function(type){
                var year = $scope.yearValue;
                $scope.data.dataperiods = filtersManager.getPeriodArray(type,year);
            console.log($scope.data.dataperiods)
        };

        //add year by one
        $scope.nextYear = function () {
                $scope.yearValue = parseInt($scope.yearValue) + 1;
                $scope.getPeriodArray($scope.periodType);
        };
        //reduce year by one
        $scope.previousYear = function () {
                $scope.yearValue = parseInt($scope.yearValue) - 1;
                $scope.getPeriodArray($scope.periodType);
        };

        $scope.changePeriodType = function(type){
                $scope.getPeriodArray(type);
        };
        $scope.getPeriodArray($scope.periodType);
        $scope.loading_message1 = "Preparing Score card Information";
        $scope.updateScoreCard = function(){
            $scope.loading = true;
            //orgUnit Selection
            if($scope.data.outOrganisationUnits){
                $scope.orgdata = {
                    name:$scope.data.outOrganisationUnits[0].name,
                    id : $scope.data.outOrganisationUnits[0].id,
                    children : []
                };
                angular.forEach($scope.data.outOrganisationUnits[0].children,function(child){
                    $scope.orgdata.children.push({
                        id:child.id,
                        name:child.name,
                        children:child.children})
                })
            }else{
                $scope.orgdata = {
                    name:$scope.data.orgUnitTree[0].name,
                    id : $scope.data.orgUnitTree[0].id,
                    children : []
                };
                angular.forEach($scope.data.orgUnitTree[0].children,function(child){
                    $scope.orgdata.children.push({
                        id:child.id,
                        name:child.name,
                        children:child.children
                    })
                })
            }

            //period selection
            if($scope.data.outOrPeriods){
                $scope.selectedPeriod = {
                    type : $scope.periodType,
                    name : $scope.data.outOrPeriods[0].name,
                    id : $scope.data.outOrPeriods[0].id
                };
            }else{
                $scope.selectedPeriod = {
                    type : $scope.periodType,
                    name : $scope.data.outOrPeriods[0].name,
                    id : $scope.data.outOrPeriods[0].id
                };
            }
            $scope.reportDimensions.orgUnitChildren = $scope.orgdata.children;
            $http.get(DHIS2URL+"/api/dataStore/scorecards/"+$routeParams.scorecardid).success(function(data){
                $scope.loading_amount += 3;
                data.key = $routeParams.scorecardid;
                $scope.currentSocreCard = data;
                $scope.reportDimensions = {
                    period : $scope.selectedPeriod.id,
                    orgUnit : {
                        name:$scope.orgdata.name,
                        id: $scope.orgdata.id
                    },
                    name : $scope.orgdata.name,
                    orgUnitChildren: $scope.orgdata.children
                };
                $scope.getItemsFromGroups();
                $scope.assignValueToIndicators($scope.orgdata);
                console.log($scope.currentSocreCard);
            });
        };

        $scope.getItemsFromGroups = function(){
            $scope.indicators_list = [];
            angular.forEach($scope.currentSocreCard.data_settings.indicator_holder_groups,function(data){
                angular.forEach(data.indicator_holder_ids,function(holders_list){
                    angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder){
                        if(holder.holder_id == holders_list){
                            $scope.indicators_list.push(holder)
                        }
                    });
                });
            });
        };

        $scope.getIndicatorTitle = function(holder){
            var title = [];
            angular.forEach(holder.indicators,function(data){
                title.push(data.title)
            });
            return title.join(' / ')
        };

        $scope.getHighletedIndicatorValue = function(rows,dx){
            var amount = 0;
            angular.forEach(rows,function(data){
                if(data[0] == dx){
                    amount = data[2];
                    return data[2];
                }
            });
            return amount
        };

        $scope.parcent = 0;
        $scope.loadData = function(orgUnit){
            $scope.loading = true;
            //put values on the highlighted indicators
            if($routeParams.scorecardid == "RMNHScoreCard" || $routeParams.scorecardid == "RMNHScoreCardNew" ){
                var idss = [];
                angular.forEach($scope.currentSocreCard.highlighted_indicators.definition,function(highleted_indicator){
                    idss.push(highleted_indicator.id)
                });
                var highleted_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+idss.join(";")+'&dimension=ou:m0frOspS7JY&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                var previous_highleted_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+idss.join(";")+'&dimension=ou:m0frOspS7JY&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                $http.get(highleted_data_url).then(function(indicator_data){

                    angular.forEach($scope.currentSocreCard.highlighted_indicators.definition,function(highleted_indicator){
                        highleted_indicator.values = $scope.getHighletedIndicatorValue(indicator_data.data.rows, highleted_indicator.id)
                    });
                    $http.get(previous_highleted_data_url).then(function(indicator_data){
                        angular.forEach($scope.currentSocreCard.highlighted_indicators.definition,function(highleted_indicator){
                            highleted_indicator.old_values = $scope.getHighletedIndicatorValue(indicator_data.data.rows, highleted_indicator.id)
                        });
                    });
                });
            }


            var orgUnits = [];
            orgUnits.push(orgUnit.id);
            angular.forEach(orgUnit.children,function(orgunit){
                orgUnits.push(orgunit.id);
            });
            var processed = 0;
            var indicator_count = 0;
            angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder) {
                angular.forEach(holder.indicators, function (indicator) {
                    indicator_count++;
                })
            });
            angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder){
                angular.forEach(holder.indicators,function(indicator){
                    if($routeParams.scorecardid == "RMNHScoreCard" || $routeParams.scorecardid == "RMNHScoreCardNew" ){
                        if(indicator.type == 'indicator'){
                            var data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                            var previous_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+pushPeriodOneStep($scope.reportDimensions.period)+'&displayProperty=NAME'
                            if(indicator.hasOwnProperty('values')){

                            }else{
                                indicator.values = {};
                            }
                            indicator.previous_values = {};
                            indicator.showTopArrow = [];
                            indicator.showBottomArrow = [];
                            var effective_gap = parseInt(indicator.arrow_settings.effective_gap);
                            $http.get(data_url).then(function(indicator_data){
                                $scope.loading_amount += 5;
                                angular.forEach(orgUnits,function(ou){
                                    indicator.values[ou] = $scope.getDataFromAnalytics(indicator_data.data.rows,ou)
                                });
                                processed++;
                                if(processed == indicator_count){
                                    $scope.loading = false;
                                }
                                $http.get(previous_data_url).then(function(previous_indicator_data){
                                    angular.forEach(orgUnits,function(ou){
                                        indicator.previous_values[ou] = $scope.getDataFromAnalytics(previous_indicator_data.data.rows,ou);
                                        if(ou == orgUnit.id){
                                        }
                                    });


                                    angular.forEach(indicator.values,function(val,key){
                                        if(parseInt(indicator.previous_values[key]) != 0){
                                            var check = parseInt(val) > (parseInt(indicator.previous_values[key])+effective_gap);
                                            var check1 = parseInt(val) < (parseInt(indicator.previous_values[key]) - effective_gap);
                                            if(check){
                                                indicator.showTopArrow[key] = true;
                                            }else{
                                                indicator.showTopArrow[key] = false;
                                            }

                                            if(check1){
                                                indicator.showBottomArrow[key] = true;
                                            }else{
                                                indicator.showBottomArrow[key] = false;
                                            }
                                        }
                                    })
                                },function(){
                                    //error codes will stay here
                                })
                            },function(){
                                //error codes will stay here
                            })


                        }
                        else if(indicator.type == 'ors_sql_view'){
                            if(indicator.hasOwnProperty('values')){

                            }else{
                                indicator.values = {};
                            }
                            $scope.loading_amount += 5;
                            angular.forEach(orgUnits,function(ou){
                                $scope.assignSORAvailability(ou).then(function(ors_data){
                                    indicator.values[ou] = ors_data;
                                    processed++;
                                    if(processed == indicator_count){
                                        $scope.loading = false;
                                    }
                                })
                            })
                        }
                        else if(indicator.type == 'timeless_sql_view'){
                            $scope.loading_amount += 5;
                            if(indicator.hasOwnProperty('values')){

                            }else{
                                indicator.values = {};
                            }
                            angular.forEach(orgUnits,function(ou){
                                indicator.values[ou] = $scope.assignTimelenessValues(ou);
                            });
                            processed++;
                            if(processed == indicator_count){
                                $scope.loading = false;
                            }
                        }
                    }
                    else{
                        /**
                         * We will work with this part for the rest
                         *
                         * @type {string}
                         */

                        var data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                        var previous_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+pushPeriodOneStep($scope.reportDimensions.period)+'&displayProperty=NAME'
                        if(indicator.hasOwnProperty('values')){

                        }else{
                            indicator.values = {};
                        }
                        indicator.previous_values = {};
                        indicator.showTopArrow = [];
                        indicator.showBottomArrow = [];
                        var effective_gap = (indicator.hasOwnProperty("arrow_settings"))?parseInt(indicator.arrow_settings.effective_gap):0;
                        $scope.loading_message1 = "Getting "+indicator.name+" values";
                        $http.get(data_url).then(function(indicator_data){
                            $scope.loading_amount += parseInt(100 / indicator_count) + 1;
                            angular.forEach(orgUnits,function(ou){
                                indicator.values[ou] = $scope.getDataFromAnalytics(indicator_data.data.rows,ou)
                            });
                            processed++;
                            $scope.parcent = (processed / indicator_count) * 100;
                            if(processed == indicator_count){
                                $scope.loading = false;
                            }
                            $http.get(previous_data_url).then(function(previous_indicator_data){
                                angular.forEach(orgUnits,function(ou){
                                    indicator.previous_values[ou] = $scope.getDataFromAnalytics(previous_indicator_data.data.rows,ou);
                                    if(ou == orgUnit.id){
                                    }
                                });

                                if(indicator.hasOwnProperty("arrow_settings")){
                                    // if(indicator.arrow_settings.effective_gap.display){
                                        angular.forEach(indicator.values,function(val,key){
                                            if(parseInt(indicator.previous_values[key]) != 0){
                                                var check = parseInt(val) > (parseInt(indicator.previous_values[key])+effective_gap);
                                                var check1 = parseInt(val) < (parseInt(indicator.previous_values[key]) - effective_gap);
                                                if(check){
                                                    indicator.showTopArrow[key] = true;
                                                }else{
                                                    indicator.showTopArrow[key] = false;
                                                }

                                                if(check1){
                                                    indicator.showBottomArrow[key] = true;
                                                }else{
                                                    indicator.showBottomArrow[key] = false;
                                                }
                                            }
                                        })
                                    // }
                                }

                            },function(){
                                //error codes will stay here
                            })
                        },function(){
                            //error codes will stay here
                        })
                    }


                })
            });
        };

        $scope.assignValueToIndicators = function(orgUnit){
            $scope.loading = true;
            //put values on the highlighted indicators
            if($routeParams.scorecardid == "RMNHScoreCard" || $routeParams.scorecardid == "RMNHScoreCardNew" ){
                var idss = [];
                angular.forEach($scope.currentSocreCard.highlighted_indicators.definition,function(highleted_indicator){
                    idss.push(highleted_indicator.id)
                });
                var highleted_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+idss.join(";")+'&dimension=ou:m0frOspS7JY&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                var previous_highleted_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+idss.join(";")+'&dimension=ou:m0frOspS7JY&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                $http.get(highleted_data_url).then(function(indicator_data){

                    angular.forEach($scope.currentSocreCard.highlighted_indicators.definition,function(highleted_indicator){
                        highleted_indicator.values = $scope.getHighletedIndicatorValue(indicator_data.data.rows, highleted_indicator.id)
                    });
                    $http.get(previous_highleted_data_url).then(function(indicator_data){
                        angular.forEach($scope.currentSocreCard.highlighted_indicators.definition,function(highleted_indicator){
                            highleted_indicator.old_values = $scope.getHighletedIndicatorValue(indicator_data.data.rows, highleted_indicator.id)
                        });
                    });
                });
            }


            var orgUnits = [];
            orgUnits.push(orgUnit.id);
            angular.forEach(orgUnit.children,function(orgunit){
                orgUnits.push(orgunit.id);
            });
            var processed = 0;
            var indicator_count = 0;
            angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder) {
                angular.forEach(holder.indicators, function (indicator) {
                    indicator_count++;
                })
            });
            angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder){
                angular.forEach(holder.indicators,function(indicator){
                    if($routeParams.scorecardid == "RMNHScoreCard" || $routeParams.scorecardid == "RMNHScoreCardNew" ){
                        if(indicator.type == 'indicator'){
                            var data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                            var previous_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+pushPeriodOneStep($scope.reportDimensions.period)+'&displayProperty=NAME'
                            if(indicator.hasOwnProperty('values')){

                            }else{
                                indicator.values = {};
                            }
                            indicator.previous_values = {};
                            indicator.showTopArrow = [];
                            indicator.showBottomArrow = [];
                            var effective_gap = parseInt(indicator.arrow_settings.effective_gap);

                            $scope.loading_message1 = "Getting "+indicator.name+" values";
                            $http.get(data_url).then(function(indicator_data){
                                $scope.loading_amount += 5;
                                angular.forEach(orgUnits,function(ou){
                                    indicator.values[ou] = $scope.getDataFromAnalytics(indicator_data.data.rows,ou)
                                });
                                processed++;
                                if(processed == indicator_count){
                                    $scope.loading = false;
                                }
                                $http.get(previous_data_url).then(function(previous_indicator_data){
                                    angular.forEach(orgUnits,function(ou){
                                        indicator.previous_values[ou] = $scope.getDataFromAnalytics(previous_indicator_data.data.rows,ou);
                                        if(ou == orgUnit.id){
                                        }
                                    });


                                    angular.forEach(indicator.values,function(val,key){
                                        if(parseInt(indicator.previous_values[key]) != 0){
                                            var check = parseInt(val) > (parseInt(indicator.previous_values[key])+effective_gap);
                                            var check1 = parseInt(val) < (parseInt(indicator.previous_values[key]) - effective_gap);
                                            if(check){
                                                indicator.showTopArrow[key] = true;
                                            }else{
                                                indicator.showTopArrow[key] = false;
                                            }

                                            if(check1){
                                                indicator.showBottomArrow[key] = true;
                                            }else{
                                                indicator.showBottomArrow[key] = false;
                                            }
                                        }
                                    })
                                },function(){
                                    //error codes will stay here
                                })
                            },function(){
                                //error codes will stay here
                            })


                        }
                        else if(indicator.type == 'ors_sql_view'){
                            if(indicator.hasOwnProperty('values')){

                            }else{
                                indicator.values = {};
                            }
                            $scope.loading_amount += 5;
                            angular.forEach(orgUnits,function(ou){
                                $scope.assignSORAvailability(ou).then(function(ors_data){
                                    indicator.values[ou] = ors_data;
                                    processed++;
                                    if(processed == indicator_count){
                                        $scope.loading = false;
                                    }
                                })
                            })
                        }
                        else if(indicator.type == 'timeless_sql_view'){
                            $scope.loading_amount += 5;
                            if(indicator.hasOwnProperty('values')){

                            }else{
                                indicator.values = {};
                            }
                            angular.forEach(orgUnits,function(ou){
                                indicator.values[ou] = $scope.assignTimelenessValues(ou);
                            });
                            processed++;
                            if(processed == indicator_count){
                                $scope.loading = false;
                            }
                        }
                    }
                    else{
                        /**
                         * We will work with this part for the rest
                         *
                         * @type {string}
                         */

                        var data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+$scope.reportDimensions.period+'&displayProperty=NAME'
                        var previous_data_url = DHIS2URL +'/api/analytics.json?dimension=dx:'+indicator.id+'&dimension=ou:'+orgUnits.join(';')+'&filter=pe:'+pushPeriodOneStep($scope.reportDimensions.period)+'&displayProperty=NAME'
                        if(indicator.hasOwnProperty('values')){

                        }else{
                            indicator.values = {};
                        }
                        indicator.previous_values = {};
                        indicator.showTopArrow = [];
                        indicator.showBottomArrow = [];
                        var effective_gap = (indicator.hasOwnProperty("arrow_settings"))?parseInt(indicator.arrow_settings.effective_gap):0;
                        $http.get(data_url).then(function(indicator_data){
                            $scope.loading_message1 = "Getting "+indicator.name +" values";
                            angular.forEach(orgUnits,function(ou){
                                indicator.values[ou] = $scope.getDataFromAnalytics(indicator_data.data.rows,ou)
                            });
                            processed++;
                            $scope.loading_amount = (processed/indicator_count)*100;
                            if(processed == indicator_count){
                                $scope.loading = false;
                            }
                            $http.get(previous_data_url).then(function(previous_indicator_data){
                                angular.forEach(orgUnits,function(ou){
                                    indicator.previous_values[ou] = $scope.getDataFromAnalytics(previous_indicator_data.data.rows,ou);
                                    if(ou == orgUnit.id){
                                    }
                                });

                                if(indicator.hasOwnProperty("arrow_settings")){
                                        angular.forEach(indicator.values,function(val,key){
                                            if(parseInt(indicator.previous_values[key]) != 0){
                                                var check = parseInt(val) > (parseInt(indicator.previous_values[key])+effective_gap);
                                                var check1 = parseInt(val) < (parseInt(indicator.previous_values[key]) - effective_gap);
                                                console.log(check)
                                                console.log(check1)
                                                if(check){
                                                    indicator.showTopArrow[key] = true;
                                                }else{
                                                    indicator.showTopArrow[key] = false;
                                                }

                                                if(check1){
                                                    indicator.showBottomArrow[key] = true;
                                                }else{
                                                    indicator.showBottomArrow[key] = false;
                                                }
                                            }
                                        })
                                }

                            },function(){
                                //error codes will stay here
                            })
                        },function(){
                            //error codes will stay here
                        })
                    }


                })
            });

        };

        $scope.assignTimelenessValues = function (ou) {
            var facility_completess = 0;
            var all_facility = 0;
            angular.forEach($scope.facility_timeleness,function(row){
                if(ou == "m0frOspS7JY"){
                    all_facility += 1;
                    if(isNaN(parseInt(row[5]))){

                    }else{

                        if(parseInt(row[5]) == 1 ){
                            facility_completess += 1;
                        }if(parseInt(row[5]) == 0){

                        }
                    }
                }else{
                    if(row[2] == ou || row[3] == ou){
                        all_facility += 1;
                        if(isNaN(parseInt(row[5]))){

                        }else{

                            if(parseInt(row[5]) == 1 ){
                                facility_completess += 1;
                            }if(parseInt(row[5]) == 0){

                            }
                        }
                    }
                }

            });
            var parcent =( facility_completess / all_facility )* 100;
            return parcent.toFixed(2)
        };

        $scope.assignSORAvailability = function (ou) {
            var deferred = $q.defer();
            $http.get(DHIS2URL+"/api/organisationUnits.json?filter=path:ilike:"+ou+"&filter=level:eq:4&paging=true&pageSize=0&fields=id").then(function(facility_count){
                var facility_with_ors = 0;
                angular.forEach($scope.ors_facility_list,function(row){
                    if(ou == "m0frOspS7JY"){
                        if(isNaN(parseInt(row[2]))){
                        }else{
                            facility_with_ors += parseInt(row[2]);
                        }
                    }else{
                        if(row[0] == ou || row[1] == ou){
                            if(isNaN(parseInt(row[2]))){
                            }else{
                                facility_with_ors += parseInt(row[2]);
                            }
                        }
                    }
                });
                var parcent = ( facility_with_ors / parseInt(facility_count.data.pager.total) ) * 100;
                deferred.resolve(parcent.toFixed(2));
            },function(){
                deferred.reject();
                //error message stays here
            });
            return deferred.promise;
        };

        $scope.getDataFromAnalytics = function(rows,orgunit){
            var amount = 0;
            angular.forEach(rows,function(data){
                if(data[1] == orgunit){
                    amount = data[2];
                    return data[2];
                }
            });
            return amount
        };

        $scope.clickMe = function(){
            alert('nimebonywa')
        };

        $scope.getIndicatorLabel = function(indicator, label){
            labels = [];
            angular.forEach(indicator.indicators,function(data){
                angular.forEach(data.additional_label_values,function(lab){
                    labels.push(lab[label.id])
                })
            });
            return labels.join(' / ')
        };

        $scope.prepareDataForCSV = function(orgUnit){
            var dataToReturn = [];
            var dataArray1 = {'Organisation Unit': orgUnit.name};
            angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder) {
                angular.forEach(holder.indicators, function (indicator) {
                    dataArray1[indicator.title] = indicator.values[orgUnit.id]
                })
            });
            dataToReturn.push(dataArray1);
            $scope.sortedOrgUnits = $filter('orderBy')(orgUnit.children, 'name');
            angular.forEach($scope.sortedOrgUnits,function(orgunit){
                var dataArray = {'Organisation Unit':orgunit.name};
                angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder) {
                    angular.forEach(holder.indicators, function (indicator) {
                        dataArray[indicator.title] = indicator.values[orgunit.id]
                    })
                });
                dataToReturn.push(dataArray)
            });
            return dataToReturn;

        };

        $scope.getHeader = function(){
            var header = ["Organisation Unit"];
            angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder) {
                angular.forEach(holder.indicators, function (indicator) {
                    header.push(indicator.title)
                })
            });

            return header;
        };

        $scope.hoverOut = function(){
            $scope.hoverEdit = false;
        };

        $scope.doQuery  = function (medicine) {
            var deferred = $q.defer();
            $http.get(DHIS2URL + '/api/sqlViews/SpYKc60xaiW/data.json?var=month:'+$scope.lastMonth+"&var=data:"+medicine)
                .success(function (results) {
                    deferred.resolve(results.rows);
                })
                .error(function (errorMessageData) {
                    deferred.reject();
                });
            return deferred.promise;
        };

        $scope.entirePackageMedicines = [
            {
                'name':'DPT + HepB/ HiB vaccine for immunization',
                'eligible':'HKYab4TIAXs',
                'available':'sA9bxsRppLr'
            },{
                'name':'Vidonge vya ALU vya kumeza',
                'eligible':'P6nVr0o4O8O',
                'available':'cCCL5yNl301'
            },{
                'name':'Amoxycillin/ Cotrimoxazole ya maji',
                'eligible':'WAZAQkuQonf',
                'available':'QWQ7zRKzB72'
            },{
                'name':'Amoxycillin/ Cotrimoxazole ya vidonge',
                'eligible':'UNw1l9iegze',
                'available':'QWQ7zRKzB72'
            },{
                'name':'Dawa za vidonge za minyoo Albendazole au Mebendazole',
                'eligible':'D9UegHR72F7',
                'available':'Kj2VNr4bNmK'
            },{
                'name':"Dawa ya kuhara ya kuchanganya na maji (ORS)",
                'eligible':'YdumyTaJeaY',
                'available':'IctQGELdKnU'
            },{
                'name':'Sindano ya Ergometrine au Oxytocin au Vidonge vya Misoprostol',
                'eligible':'KhlPt64ioMc',
                'available':'ySw4xVVyeJm'
            },{
                'name':'Dawa ya sindano ya Uzazi wa mapngo (Depo)',
                'eligible':'DPxobo6eezJ',
                'available':'gOnXFvuLClY'
            },{
                'name':'Maji ya mishipa (Dextrose 5% au Sodium chloride+Dextrose)',
                'eligible':'R5wsRAcTOtA',
                'available':'n0X9iB1Z5uS'
            },{
                'name':'Mabomba ya sindano kwa matumizi ya mara moja(Disposable)',
                'eligible':'evvqSpYy99J',
                'available':'AT7PchtF6Jy'
            },{
                'name':'Kipimo cha malaria cha haraka (MRDT) au vifaa vya kupimia katika Hadubini',
                'eligible':'mzbVXqclpu5',
                'available':'kolbisAPN7E'
            },{
                'name':'Magnesium Sulphate Sindano',
                'eligible':'tAwlvOWI8B7',
                'available':'uidgoKCVqH5'
            },{
                'name':'Zinc sulphate Vidonge',
                'eligible':'QMJFvvldROR',
                'available':'sAkIbYaBsaI'
            },{
                'name':'Paracetamol Tablets',
                'eligible':'VkOXLYjgLi3',
                'available':'g0104zD4mcr'
            },{
                'name':'Benzyl Penicilline Injection',
                'eligible':'yH3JhljDGOn',
                'available':'nN3JgHEkhGB'
            },{
                'name':'Ferrous + Folic Acid Tablets',
                'eligible':'nAcASD6oJnq',
                'available':'eCBVJOvugx2'
            },{
                'name':'Metronidazole Tablets',
                'eligible':'v0s3CE7BDP9',
                'available':'kXThHIW0757'
            },{
                'name':'Sulphadoxine+pyrimetdamine tablets',
                'eligible':'JMwk7Sl2ySP',
                'available':'UiChWiTcM83'
            }
        ];

        $scope.getEntireEligility = function (period) {

            var self = this;
            var deferred = $q.defer();
            var eligible = [];
            var track = 0;
            angular.forEach($scope.entirePackageMedicines ,function(medicine){
                eligible[track]  = self.doQuery(medicine.eligible);
                track++;
            });
            $q.all(eligible).then(function(res){
                deferred.resolve(res);
            });
            return deferred.promise;

        };

        $scope.getEntireAvailability = function (period) {
            var self = this;
            var deferred = $q.defer();
            var available = [];
            var track = 0;
            angular.forEach($scope.entirePackageMedicines ,function(medicine){
                available[track] = self.doQuery(medicine.available);
                track++;
            });
            $q.all(available).then(function(res){
                deferred.resolve(res);
            });

            return deferred.promise;

        };

        $scope.combinedRows = [];
        if($routeParams.scorecardid == "RMNHScoreCard" || $routeParams.scorecardid == "RMNHScoreCardNew" ){
            $scope.getEntireEligility().then(function(eligible_data){
                $scope.loading_amount += 5;
                $scope.getEntireAvailability().then(function(available_data){
                    $scope.loading_amount += 5;
                    angular.forEach(eligible_data[0],function(value,key){
                        $scope.combinedRows.push(value)
                    });
                    angular.forEach($scope.entirePackageMedicines,function(medicine,key){
                        angular.forEach(eligible_data[key],function(value,key1){
                            $scope.combinedRows[key1].push(value[3])
                        });

                        angular.forEach(available_data[key],function(value,key1){
                            $scope.combinedRows[key1].push(value[3])
                        })
                    });
                    var orgUnits = [];
                    orgUnits.push($scope.reportDimensions.orgUnit.id)
                    angular.forEach($scope.reportDimensions.orgUnitChildren,function(orgunit){
                        orgUnits.push(orgunit.id);
                    });
                    angular.forEach($scope.currentSocreCard.data_settings.indicator_holders,function(holder) {
                        angular.forEach(holder.indicators, function (indicator) {
                            if(indicator.type == 'entire_sql_view'){
                                if(indicator.hasOwnProperty('values')){

                                }else{
                                    indicator.values = {};
                                }
                                angular.forEach(orgUnits,function(ou){
                                    indicator.values[ou] = $scope.assignEntirePackage($scope.combinedRows,ou);
                                })
                            }
                        });
                    });

                });

            });

        }

        $scope.assignEntirePackage = function(rows,ou){
            var facility_with_entire_package = 0;
            var all_facility = 0;
            angular.forEach(rows,function(row){
                if(ou == "m0frOspS7JY"){
                    all_facility += 1;
                    var complete = true;
                    for(var i=3;i<row.length; i++){
                        if(parseInt(row[5]) != 1 ){
                            complete = false;
                        }
                    }
                    if(complete){
                        facility_with_entire_package += 1;
                    }
                }else{
                    if(row[0] == ou || row[1] == ou){
                        all_facility += 1;
                        var complete = true;
                        for(var i=3;i<row.length; i++){
                            if(parseInt(row[5]) != 1 ){
                                complete = false;
                            }
                        }
                        if(complete){
                            facility_with_entire_package += 1;
                        }
                    }
                }

            });
            var parcent =( facility_with_entire_package / all_facility )* 100;
            return parcent.toFixed(2)
        };

        //trusting custom styles from injected html
        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };

        $scope.assignBgColor = function(object,value){
            var color = "#BBBBBB";
            angular.forEach(object.legendset,function(data){

                if(data.max == "-"){

                    if(parseInt(value) >= parseInt(data.min) ){
                        color = data.color;
                    }
                }else{
                    if(parseInt(value) >= parseInt(data.min) && parseInt(value) <= parseInt(data.max)){
                        color = data.color;
                    }
                }
            });
            return color;
        };

        $scope.subshow = {};
        $scope.redirectTo = function(orgunit){
            if($scope.subshow.hasOwnProperty(orgunit.id)){
                $scope.subshow = {};
            }else{
                $scope.subshow = {};
                $scope.assignValueToIndicators(orgunit);
                $scope.subshow[orgunit.id] = true;
            }
        };

        //dealing with the model to play around with data
        $scope.analysisperiodType = "Quarterly";
        $scope.multiPeriod = true;
        $scope.analysis_show_table = false;
        $scope.analysis_show_chart = false;
        $scope.analysis_show_info = true;
        $scope.analysis_show_details = false;
        $scope.series = "ou";
        $scope.column = "pe";
        $scope.chartType = "column";
        $scope.loading_analysis_data = false;

        $scope.switchXandY = function(indicator){
            if($scope.series == "ou"){
                $scope.series = "pe";
                $scope.column = "ou";
            }else{
                $scope.series = "ou";
                $scope.column = "pe";
            }
            $scope.updateIndicatorCard(indicator,$scope.chartType)
        };

        //loading period settings
        $scope.getAnalysisPeriodArray = function(type){
            if(type.indexOf("Relative") > -1){
                $scope.multiPeriod = false;
            }else{
                $scope.multiPeriod = true;
            }
            var year = $scope.analysisYearValue;
            $scope.data.analysisperiods = filtersManager.getPeriodArray(type,year);
        };

        //add year by one
        $scope.analysisNextYear = function () {
            $scope.analysisYearValue = parseInt($scope.analysisYearValue) + 1;
            $scope.getAnalysisPeriodArray($scope.analysisperiodType);
        };
        //reduce year by one
        $scope.analysisPreviousYear = function () {
            $scope.analysisYearValue = parseInt($scope.analysisYearValue) - 1;
            $scope.getAnalysisPeriodArray($scope.analysisperiodType);
        };
        $scope.AnalysisChangePeriodType = function(type){
            $scope.getAnalysisPeriodArray(type);
        };
        $scope.getAnalysisPeriodArray($scope.analysisperiodType);

        $scope.analysisChart = {};
        $scope.updateIndicatorCard = function(indicator,chartType){
            console.log(indicator);
            console.log("Helloo");
            $scope.loading_analysis_data = true;
            $scope.chartType = chartType;
            $scope.orgunitsArray = [];
            $scope.periodArray = [];
            $scope.dataArray = [];
            angular.forEach($scope.data.outAnalysisOrganisationUnits,function(orgunit){
                $scope.orgunitsArray.push(orgunit.id)
            });
            angular.forEach($scope.data.outAnalysisOrPeriods,function(period){
                $scope.periodArray.push(period.id)
            });
            angular.forEach(indicator.indicators,function(value){
                $scope.dataArray.push(value.id)
            });
            var url = DHIS2URL + "/api/analytics.json?dimension=dx:" + $scope.dataArray.join(";") + "&dimension=ou:" + $scope.orgunitsArray.join(";") + "&dimension=pe:" + $scope.periodArray.join(";") + "&displayProperty=NAME";
            $http.get(url).success(function(data){
                $scope.currentAnalytics = data;
                if(chartType == "table"){
                    $scope.analysisChart = chartsManager.drawTable(data,$scope.series,[],$scope.column,[],'none','',$scope.getIndicatorTitle(indicator));
                    $scope.analysis_show_table = true;
                    $scope.analysis_show_chart = false;
                    $scope.analysis_show_info = false;
                    $scope.analysis_show_details = false;
                }else if(chartType == "info"){
                    var dataElementArray=[];
                    var indicatorArray=[];
                    var datasetArray=[];
                    angular.forEach($scope.dataArray,function(dxUid){
                        var dataElementApi=
                            $resource('../../../api/dataElements/'+dxUid+'.json?fields=id,name,aggregationType,displayName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataSets[id,name,periodType]',{get:{method:"JSONP"}});
                        var dataelements=dataElementApi.get(function(dataElementObject){
                            dataElementArray.push(dataElementObject);
                            $scope.dataElements=dataElementArray;
                           // console.log($scope.dataElements[dashboardItem.id]);
                            // $scope.dashboardLoader[dashboardItem.id] = false;
                        },function(response){
                            if(response.status==404){
                                var indicatorApi=
                                    $resource('../../../api/indicators/'+dxUid+'.json?fields=displayName,id,name,numeratorDescription,denominatorDescription,denominator,numerator,indicatorType[id,name],dataSets[id,name,periodType]',{get:{method:"JSONP"}});
                                var indicators=indicatorApi.get(function(indicatorObject){
                                    var expApi=
                                        $resource('../../../api/expressions/description',{get:{method:"JSONP"}});
                                    var numeratorExp=expApi.get({expression:indicatorObject.numerator},function(numeratorText){
                                        var numerator=numeratorText.description;
                                        var denominatorExp=expApi.get({expression:indicatorObject.denominator},function(denominatorText){
                                            var denominator=denominatorText.description;
                                            indicatorArray.push({name:indicatorObject.name,uid:indicatorObject.id,denominatorDescription:indicatorObject.denominatorDescription,numeratorDescription:indicatorObject.numeratorDescription,numerator:numerator,denominator:denominator,indicatorType:indicatorObject.indicatorType,dataSets:indicatorObject.dataSets});
                                            $scope.indicators=indicatorArray;
                                            //console.log($scope.indicators[dashboardItem.id]);
                                            //$scope.dashboardLoader[dashboardItem.id] = false;
                                        });
                                    });

                                },function(rensponse){
                                    if(response.status===404){
                                        var datasetApi=
                                            $resource('../../../api/dataSets/'+dxUid +'.json?fields=id,name,periodType,shortName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]',{get:{method:"JSONP"}});
                                        var dataSets=datasetApi.get(function(datasetObject) {
                                            datasetArray.push(datasetObject);
                                            $scope.datasets =datasetArray;
                                            //$scope.dashboardLoader[dashboardItem.id] = false;
                                        });
                                    }

                                })
                            }

                        });
                    });
                    $scope.analysis_show_table = false;
                    $scope.analysis_show_chart = false;
                    $scope.analysis_show_info = false;
                    $scope.analysis_show_details = true;
                }else{
                    $scope.analysisChart = chartsManager.drawChart(data,$scope.series,[],$scope.column,[],'none','',$scope.getIndicatorTitle(indicator),chartType);
                    $scope.analysis_show_table = false;
                    $scope.analysis_show_chart = true;
                    $scope.analysis_show_info = false;
                    $scope.analysis_show_details = false;
                }
                $scope.loading_analysis_data = false;

            })
        };

        //prepare data for use in csv
        $scope.prepareDataForCSV = function(indicator,data){
            var chartObject = chartsManager.drawChart(data,"ou",[],'pe',[],'none','',$scope.getIndicatorTitle(indicator),'bar')
            var items = [];
            angular.forEach(chartObject.series,function(value){
                var obj = {name:value.name};
                var i = 0;
                angular.forEach(chartObject.options.xAxis.categories,function(val){
                    obj[val] = value.data[i];
                    i++;
                });
                items.push(obj);
            });
            return items;
        };

        $scope.show_orgunit_filter = false;

        $scope.showFilter = function(){
          $scope.show_orgunit_filter = true;
        };
        $scope.hideFilter = function(){
          $scope.show_orgunit_filter = false;
        };


    }]);

function pushPeriodOneStep(period){
    if(period.length == 4){
        return parseInt(period)-1;
    }
    else if (period.substring(4,5) == 'Q'){
        var year = period.substring(0,4);
        var quater = period.substring(4,6);
        var time = "";
        if(quater == "Q4"){
            time = year+"Q3";
        }else if(quater == "Q3"){
            time = year+"Q2";
        }else if(quater == "Q2"){
            time = year+"Q1";
        }else if(quater == "Q1"){
            var yr = parseInt(year)-1;
            time = yr+"Q4";
        }
        return time;
    }
    else if (period.substring(4,5) == 'S'){
        var year = period.substring(0,4);
        var six_month = period.substring(4,6);
        var time = "";
        if(six_month == "S1"){
            var yr = parseInt(year)-1;
            time = yr+"S2";
        }else if(six_month == "S2"){
            time = year+"S1"
        }
        return time;
    }
    else if (period.substring(6,7) == 'B'){
        var year = period.substring(0,4);
        var six_month = period.substring(4,7);
        var time = "";
        if(six_month == "01B"){
            var yr = parseInt(year)-1;
            time = yr+"06B";
        }else if(six_month == "02B"){
            time = year+"01B"
        }else if(six_month == "03B"){
            time = year+"02B"
        }else if(six_month == "04B"){
            time = year+"03B"
        }else if(six_month == "05B"){
            time = year+"04B"
        }else if(six_month == "06B"){
            time = year+"05B"
        }
        return time;
    }
    else{
        var year = period.substring(0,4);
        var month = period.substring(4,6);
        var time = "";
        if(month == "02"){
            time = year+"01";
        }else if(month == "03"){
            time = year+"02";
        }else if(month == "04"){
            time = year+"03";
        }else if(month == "05"){
            time = year+"04";
        }else if(month == "06"){
            time = year+"05";
        }else if(month == "07"){
            time = year+"06";
        }else if(month == "08"){
            time = year+"07";
        }else if(month == "09"){
            time = year+"08";
        }else if(month == "10"){
            time = year+"09";
        }else if(month == "11"){
            time = year+"10";
        }else if(month == "12"){
            time = year+"11";
        }else if(month == "01"){
            var yr = parseInt(year)-1;
            time = yr+"12";
        }
        return time;
    }
}
function addPeriodOneStep(period){
    var year = period.substring(0,4);
    var quater = period.substring(4,6);
    var time = "";
    var names = "";
    if(quater == "Q4"){
        var yr = parseInt(year)+1;
        time = yr+"Q1";
    }else if(quater == "Q3"){
        time = year+"Q4";
    }else if(quater == "Q2"){
        time = year+"Q3";
    }else if(quater == "Q1"){
        time = year+"Q2";
    }
    return time;
}
function getPeroidName(period){
    var year = period.substring(0,4);
    var quater = period.substring(4,6);
    var time = "";
    var names = "";
    if(quater == "Q4"){
        names = "Oct - Dec "+year;
    }else if(quater == "Q3"){
        names = "July - Sept "+year;
    }else if(quater == "Q2"){
        names = "Apr - Jun "+year;
    }else if(quater == "Q1"){
        names = "Jan - Mar "+year;
    }
    return names;
}