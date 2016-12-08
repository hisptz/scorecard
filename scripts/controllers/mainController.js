var mainController  = angular.module('mainController',[]);

mainController.controller('MainController',['$scope','$timeout','$translate','$anchorScroll','Paginator','$filter',
        '$http','CustomFormService','DHIS2URL','scoreCardManager',function($scope,
                                                                        $timeout,
                                                                        $translate,
                                                                        $anchorScroll,
                                                                        Paginator,
                                                                        $filter,
                                                                        $http,
                                                                        CustomFormService,
                                                                        DHIS2URL,
                                                                        scoreCardManager
    ){

        $scope.loading = true;
        $scope.scoreCards = [];

        //scoreCardManager.loadAllScoreCards().then(function(data){
        //   console.log("score cards:",data)
        //});
        $http.get(DHIS2URL+"/api/dataStore").success(function(dataStores){
            angular.forEach(dataStores,function(dataStore){
                if(dataStore=="scorecards") {
                    $http.get(DHIS2URL+"/api/dataStore/scorecards").success(function(scorecards){
                        $scope.loading = false;
                        angular.forEach(scorecards,function(scorecard){
                            $http.get(DHIS2URL+"/api/dataStore/scorecards/"+scorecard).success(function(data){
                                data.key = scorecard;
                                data.name = data.header.title;
                                $scope.scoreCards.push(data)
                            });

                        });
                    });
                }else {
					$scope.loading = false;
				}
            });
            console.log('Data:');
            console.log($scope.scoreCards);
        });

        $scope.deleteScoreCard = function(id){
            if (confirm("Are you sure you want to delete this score card?") == true) {
                $http.delete(DHIS2URL+"/api/dataStore/scorecards/"+id).then(function(results){
                    angular.forEach($scope.scoreCards,function(scorecard,key){
                        if(scorecard.key == id){
                            $scope.scoreCards.splice(key,1);
                        }
                    });
                }, function(errorMessage){
                    console.log( 'errors happen');
                });
            } else {
                console.log('Deletion endevoir disengaged');
            }

        };

        $scope.hoverOut = function(){
            $scope.hoverEdit = false;
        };
    }]);
