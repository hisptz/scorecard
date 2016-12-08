var mainServices = angular.module('mainServices',['ngResource']);
mainServices.factory('dashboardsManager',['$http','$q','Dashboard','DashboardItem',function($http,$q,DHIS2URL,Dashboard,DashboardItem){

    var dashboardsManager = {
        _dashBoardsPool: {},
        _dashboardObjectName: "dashboards",
        _retrieveDashboardInstance: function(dashboardId,dashboardData){
            var instance = this._dashBoardsPool[dashboardId];
            if(instance){
                instance.setData(dashboardData);
            }else {
                instance = new Dashboard(dashboardData);
                this._dashBoardsPool[dashboardId] = instance;
            }

            return instance;
        },
        _search: function(dashboardId) {
            return this._dashBoardsPool[dashboardId];
        },
        _load: function(dashboardId,deferred){
            var thisDashboard = this;
            var deferred = $q.defer();
            $http.get('../../..'+'/api/dashboards/'+dashboardId+'.json?paging=false&fields=:all,dashboardItems[id,lastsUpdated,created,type,shape,chart[:all],reportTable[:all],map[id,lastUpdated,created,name,zoom,longitude,latitude,displayName,mapViews[:all],:all],:all,program[id,name],programStage[id,name],columns[dimension,filter,legendSet[id,name],items[id,name]],rows[dimension,filter,legendSet[id,name],items[id,name]],filters[dimension,filter,legendSet[id,name],items[id,name]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits]')
                .success(function(dashboardData){
                     var dashboard = thisDashboard._retrieveDashboardInstance(dashboardData.id,dashboardData);
                    deferred.resolve(dashboard);
                })
                .error(function(errorMessageData){
                    deferred.reject();
                });
            return deferred.promise;
        },

        /* public Methods */
        /* Use this function in order to get a project instance by it's id */
        getDashboard: function(dashboardId) {
            var deferred = $q.defer();
            var dashboard = this._search(dashboardId);
            if(dashboard){
                deferred.resolve(dashboard)
            }else {
                return this._load(dashboardId,deferred);
            }
            return deferred.promise;
        },
        loadAllDashboards: function() {
            var deferred = $q.defer();
            var thisDashboard = this;
            $http.get('../../..'+'/api/dashboards'+'.json?fields=:all,dashboardItems[id,lastsUpdated,created,type,shape,chart[:all],reportTable[:all],map[id,lastUpdated,created,name,zoom,longitude,latitude,displayName,mapViews[:all],:all],:all,program[id,name],programStage[id,name],columns[dimension,filter,legendSet[id,name],items[id,name]],rows[dimension,filter,legendSet[id,name],items[id,name]],filters[dimension,filter,legendSet[id,name],items[id,name]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits]')
                .success(function(dashboardsData){
                    var dashboards = [];
                    dashboardsData.dashboards.forEach(function(dashboardData){
                        // structure before persistance;
                        var dashboard = thisDashboard._retrieveDashboardInstance(dashboardData.id,dashboardData);
                        dashboards.push(dashboard);
                    });
                    deferred.resolve(dashboards);
                })
                .error(function(errorMessageData){
                    deferred.reject();
                });
            return deferred.promise;
        },
        /* Update dashboard instance */
        setDashboard: function(dashboardData){
            var thisDashboardManager = this;
            var dashboard = this._search(dashboardData.id);
            if(dashboard) {
                dashboard.setData(dashboardData);
            }else {
                dashboard = thisDashboardManager._retrieveDashboardInstance(dashboardData);
            }
            return dashboard;
        }
    };
    return dashboardsManager;
}]);

mainServices.factory('Dashboard',['$http','$q','DashboardItem','DHIS2URL',function($http,DHIS2URL,DashboardItem,$q){
    function Dashboard(dashboardData) {
        if(dashboardData){
            this.setData(dashboardData);
        }
    };
    Dashboard.prototype = {
        setData: function(dashboardData) {
            angular.extend(this, dashboardData);
        }
    };
    return Dashboard;
}]);

mainServices.factory('dashboardItemsManager',['$http','$q','Dashboard','DashboardItem','DHIS2URL',function($http,$q,Dashboard,DashboardItem,DHIS2URL){

    var dashboardItemsManager = {
        _pool: {},
        _dashboardItemObjectName: "dashboardItems",
        _retrieveInstance: function(dashboardItemId,dashboardItemData){
            var instance = this._pool[dashboardItemId];
            if(instance){
                instance.setData(dashboardItemData);
            }else {
                instance = new DashboardItem(dashboardItemData);
                this._pool[dashboardItemId] = instance;
            }

            return instance;
        },
        _search: function(dashboardItemId) {
            return this._pool[dashboardItemId];
        },
        _load: function(dashboardItemId,deferred){
            var thisDashboardItem = this;
            var deferred = $q.defer();
            $http.get('../../..'+'/api/dashboardItems/'+dashboardItemId+'.json?fields=id,lastsUpdated,created,type,shape,chart[:all],reportTable[:all],users[:identifiable],resources[:identifiable],reports[:identifiable],:all,program[id,name],programStage[id,name],columns[dimension,filter,legendSet[id,name],items[id,name]],rows[dimension,filter,legendSet[id,name],items[id,name]],filters[dimension,filter,legendSet[id,name],items[id,name]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits')
                .success(function(dashboardItemData){
                    var dashboardItem = thisDashboardItem._retrieveInstance(dashboardItemData.id,dashboardItemData);
                    deferred.resolve(dashboardItem);
                })
                .error(function(errorMessageData){
                    console.log('error happened in loading dashboardItems');
                    deferred.reject();
                });
            return deferred.promise;
        },

        /* public Methods */
        /* Use this function in order to get a project instance by it's id */
        getDashboardItem: function(dashboardItemId) {
            var deferred = $q.defer();
            var dashboardItem = this._search(dashboardItemId);
            if(dashboardItem){
                deferred.resolve(dashboardItem)
            }else {
                return this._load(dashboardItemId,deferred);
                //deferred.resolve(this._load(projectId,deferred));
            }
            return deferred.promise;
        },
        loadAllDashboardItems: function() {
            var deferred = $q.defer();
            var thisDashboardItem = this;
            $http.get(DHIS2URL+'/api/dashboardItems'+'.json?paging=false&fields=id,lastsUpdated,created,type,shape,chart[:all],reportTable[:all],users[:identifiable],resources[:identifiable],reports[:identifiable],:all,program[id,name],programStage[id,name],columns[dimension,filter,legendSet[id,name],items[id,name]],rows[dimension,filter,legendSet[id,name],items[id,name]],filters[dimension,filter,legendSet[id,name],items[id,name]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits')
                .success(function(dashboardItemsData){
                    var dashboardItems = [];
                    dashboardItemsData.dashboardItems.forEach(function(dashboardItemData){
                        // structure before persistance;
                        var dashboardItem = thisDashboardItem._retrieveInstance(dashboardItemData.id,dashboardItemData);
                        dashboardItems.push(dashboardItem);
                    });
                    deferred.resolve(dashboardItems);
                })
                .error(function(errorMessageData){
                    deferred.reject();
                });
            return deferred.promise;
        },
        /* Update dashboardItem instance */
        setDashboardItem: function(dashboardItemData){
            var thisDashboardItemManager = this;
            var dashboardItem = this._search(dashboardItemData.id);
            if(dashboardItem) {
                dashboardItem.setData(dashboardItemData);
            }else {
                dashboardItem = thisDashboardItemManager._retrieveInstance(dashboardItemData);
            }
            return dashboardItem;
        }
    };
    return dashboardItemsManager;
}]);

mainServices.factory('DashboardItem',function($http,DHIS2URL,$q){
    function DashboardItem(dashboardItemData) {
        if(dashboardItemData){
            this.setData(dashboardItemData);
        }
    };
    DashboardItem.prototype = {
        setData: function(dashboardItemData) {
            angular.extend(this, dashboardItemData);
        }
    };
    return DashboardItem;
});



