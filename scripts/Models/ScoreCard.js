/**
 * Created by kelvin on 7/14/16.
 */
var scoreCardModel = angular.module('ScoreCardModule',['ngResource']);
scoreCardModel.factory('ScoreCard', ['$http', function($http) {
    function ScoreCard(scoreCardData) {
        if (scoreCardData) {
            this.setData(scoreCardData);
        }
        // Some other initializations related to book
    }
    ScoreCard.prototype = {
        setData: function(scoreCardData) {
            angular.extend(this, scoreCardData);
        },
        delete: function() {
            //$http.delete('ourserver/books/' + bookId);
        },
        update: function() {
            //$http.put('ourserver/books/' + bookId, this);
        },
        getImageUrl: function(width, height) {
            //return 'our/image/service/' + this.book.id + '/width/height';
        },
        isAvailable: function() {
            //get score card details
        }
    };
    return ScoreCard;
}])
    .factory('scoreCardManager', ['$http', '$q','ScoreCard','indicatorGroupManager','indicatorManager','DHIS2URL', function($http, $q, ScoreCard, indicatorGroupManager, indicatorManager, DHIS2URL) {
        var scoreCardManager = {
            /* private method shouldn't be called outside this service */
            _pool: {},
            _retrieveInstance: function(scoreCardId) {
                var instance = this._pool[scoreCardId];

                if (instance) {
                    instance.setData(scoreCardData);
                } else {
                    instance = new ScoreCard(scoreCardData);
                    this._pool[scoreCardId] = instance;
                }
                return instance;
            },
            _search: function(scoreCardId) {
                return this._pool[scoreCardId];
            },
            /*basic  structure for the score card*/
            _loadBasicStructure: function(){
              return {
                  "header": {
                      "title": "",
                      "sub_title": "",
                      "description": "",
                      "show_arrows_definition": true,
                      "show_legend_definition": true,
                      "template": {
                          "display": false,
                          "content": ""
                      }
                  },
                  "footer": {
                      "display_generated_date": false,
                      "display_title": false,
                      "sub_title": "",
                      "description": "",
                      "template": {
                          "display": false,
                          "content": ""
                      }
                  },
                  "indicator_holder_groups": [ ],
                  "legendset_definitions": [],
                  "highlighted_indicators": {
                      "display": true,
                      "definition": []
                  },
                  "additional_labels": [ ],
                  "show_score": false,
                  "show_rank": false,
                  "indicator_holders": []
              }
            },
            //basic structure for indicator holder group
            _loadIndicatorHolderGroupStructure: function(){
                return {
                    "name": "",
                    "indicator_holder_ids": [],
                    "background_color": "white",
                    "holder_style": ""
                }
            },
            _loadAdditionalLabelStructure: function(){
                return {
                    "id": "",
                    "name": ""
                }
            },
            /*basic indicators holders structure for holders to be added on score card*/
            _loadIndicatorHolderStructure: function(){
                return {
                    "holder_id": "",
                    "indicators": []
                }
            },
            /*basic indicator structure for indicators to be added on score card*/
            _loadIndicatorStructure: function(){
              return {
                  "type": "",
                  "id": "",
                  "name": "",
                  "description": "",
                  "title": "",
                  "weight": 100,
                  "high_is_good": true,
                  "legendset": [

                  ],
                  "arrow_settings": {
                      "effective_gap": 0,
                      "display": true
                  },
                  "label_settings": {
                      "display": true,
                      "font_size": ""
                  },
                  "additional_label_values": [ ]
              };
            },
            _loadlegendSetStructure: function(){
                return {
                    "color": "",
                    "min": "",
                    "max": ""
                }
            },
            _load: function(scoreCardId, deferred) {
                var scope = this;
                $http.get( DHIS2URL+'/api/dataStore/scorecards/' + scoreCardId )
                    .success(function(scoreCardData) {
                        var indicatorGroup = scope._retrieveInstance(scoreCardData.id, scoreCardData);
                        deferred.resolve(indicatorGroup);
                    })
                    .error(function() {
                        deferred.reject();
                    });
            },
            /* Public Methods */
            /* Use this function in order to get a book instance by it's id */
            generateUid: function(){
                var deferred = $q.defer();
                $http.get(DHIS2URL+'/api/system/id.json')
                    .success(function(uidCode) {
                        deferred.resolve(uidCode.codes[0]);
                    })
                    .error(function() {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            getScoreCard: function(scoreCardId) {
                var deferred = $q.defer();
                var scoreCard = this._search(scoreCardId);
                if (scoreCard) {
                    deferred.resolve(scoreCard);
                } else {
                    this._load(scoreCardId, deferred);
                }
                return deferred.promise;
            },
            /* Use this function in order to get instances of all the indicator groups */
            loadAllScoreCards: function() {
                var deferred = $q.defer();
                var scope = this;
                $http.get(DHIS2URL + '/api/dataStore/scorecards')
                    .success(function(scoreCardArray) {
                        var scoreCards = [];
                        scoreCardArray.forEach(function(scoreCardData) {
                            var scoreCard = scope._retrieveInstance(scoreCardData);
                            scoreCards.push(scoreCard);
                        });
                        deferred.resolve(scoreCards);
                    })
                    .error(function() {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            /*  This function is useful when we got somehow the book data and we wish to store it or update the pool and get a book instance in return */
            setScoreCard: function(scoreCardData) {
                var scope = this;
                var scoreCard = this._search(scoreCardData.id);
                if (scoreCard) {
                    scoreCard.setData(scoreCardData);
                } else {
                    scoreCard = scope._retrieveInstance(scoreCardData);
                }
                return scoreCard;
            }

        };
        return scoreCardManager;
    }]);