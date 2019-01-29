import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';
import {RelativePeriodService} from './relative-period.service';
import {HttpClientService} from './http-client.service';
import {UtilitiesService} from './utilities.service';

@Injectable()
export class FavoriteService {

  constructor(private http: HttpClientService,
              private utility: UtilitiesService,
              private relativePeriodService: RelativePeriodService) {
  }

  private _getFavoriteUrl(apiRootUrl: string, favoriteType: string, favoriteId: string): string {
    let url: string = apiRootUrl + favoriteType + 's/' + favoriteId + '.json?fields=';
    if (favoriteType === 'map') {
      url += 'id,user,displayName,longitude,latitude,zoom,basemap,mapViews[*,organisationUnitGroupSet[id,name,displayName,organisationUnitGroups[id,code,name,shortName,displayName,dimensionItem,symbol,organisationUnits[id,code,name,shortName]]],dataElementDimensions[dataElement[id,name,optionSet[id,options[id,name,code]]]],columns[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],rows[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],filters[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],dataDimensionItems,program[id,displayName],programStage[id,displayName],legendSet[id,displayName,legends[*]],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit]';
    } else {
      url += '*,interpretations[*],dataElementDimensions[dataElement[id,name,optionSet[id,options[id,name,code]]]],displayDescription,program[id,name],programStage[id,name],legendSet[*,legends[*]],interpretations[*,user[id,displayName],likedBy[id,displayName],comments[lastUpdated,text,user[id,displayName]]],columns[dimension,filter,legendSet,items[id,dimensionItem,dimensionItemType,displayName]],rows[dimension,filter,legendSet,items[id,dimensionItem,dimensionItemType,displayName]],filters[dimension,filter,legendSet,items[id,dimensionItem,dimensionItemType,displayName]],access,userGroupAccesses,publicAccess,displayDescription,user[displayName,dataViewOrganisationUnits],!href,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!organisationUnitGroups,!itemOrganisationUnitGroups,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits';
    }
    return url;
  }

  getFavorite(visualizationDetails: any): Observable<any> {
    const newVisualizationDetails: any = {...visualizationDetails};
    const visualizationObjectFavorite: any = {...newVisualizationDetails.visualizationObject.details.favorite};

    const favoriteOptions: any = visualizationObjectFavorite.options ? {...visualizationObjectFavorite.options} : {};

    if (!visualizationObjectFavorite.id) {
      newVisualizationDetails['favorite'] = {};
      return Observable.of(newVisualizationDetails);
    }

    return Observable.create(observer => {
      this.http.get(this._getFavoriteUrl(
        newVisualizationDetails.apiRootUrl,
        visualizationObjectFavorite.type,
        visualizationObjectFavorite.id)
      ).subscribe((favorite: any) => {
        const newFavorite: any = {...favorite};

        newFavorite.subtitle = this.getFavoriteSubtitle(favorite.filters, newVisualizationDetails.visualizationObject.details.userOrganisationUnit);

        // const combinedFavorite = this.relativePeriodService.getISOFormatFromRelativePeriod({...newFavorite, ...favoriteOptions});
        newVisualizationDetails['favorite'] = {...newFavorite, ...favoriteOptions};

        observer.next(newVisualizationDetails);
        observer.complete();
      }, error => {
        newVisualizationDetails['error'] = error;
        observer.next(newVisualizationDetails);
        observer.complete();
      });
    });
  }

  getFavoriteSubtitle(favoriteFilters: any[], userOrgUnit: string) {
    let subtitle = '';
    if (favoriteFilters) {
      const newFavoriteFilters = _.map(favoriteFilters, filterObject => {
        return {
          dimension: filterObject.dimension,
          items: _.map(filterObject.items, (item, index) => {
            if (index === '0') {
              return this._getRefinedFavouriteSubtitle(filterObject.items, userOrgUnit);
            }
          })
        };
      });

      /**
       * Get data section of filter
       */
      const dxSection = _.find(newFavoriteFilters, ['dimension', 'dx']);

      if (dxSection) {
        subtitle += subtitle !== '' ? ' - ' : '';
        subtitle += dxSection.items.join(',');
      }

      /**
       * Get period section of filter
       */
      const peSection = _.find(newFavoriteFilters, ['dimension', 'pe']);

      if (peSection) {
        subtitle += subtitle !== '' ? ' - ' : '';
        subtitle += peSection.items.join(',');
      }

      /**
       * Get orgunit section of filter
       */
      const ouSection = _.find(newFavoriteFilters, ['dimension', 'ou']);

      if (ouSection) {
        subtitle += subtitle !== '' ? ' - ' : '';
        subtitle += ouSection.items.join(',');
      }
    }
    return subtitle;
  }

  _getRefinedFavouriteSubtitle(subTitleItems, userOrgUnit) {
    let refinedSubtitle = '';
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const subTitleFunction = {
      'THIS_YEAR': () => {
        const date = new Date();
        return date.getFullYear();
      },
      'LAST_YEAR': () => {
        return (subTitleFunction['THIS_YEAR']() - 1);
      },
      'THIS_MONTH': () => {
        const date = new Date();
        return monthNames[date.getMonth()] + ' ' + date.getFullYear();
      },
      'LAST_MONTH': () => {
        const date = new Date();
        return monthNames[date.getMonth() - 1] + ' ' + date.getFullYear();
      },
      'THIS_QUARTER': () => {
        let date = new Date(); // If no date supplied, use today
        const quarter = ['January - March ', 'April - June ', 'July - September', 'October - December '];
        return quarter[Math.floor(date.getMonth() / 3)] + date.getFullYear();
      },
      'USER_ORGUNIT': () => {
        return userOrgUnit;
      }
    }

    subTitleItems.forEach(item => {
      if (item.id.indexOf('_') < 0 && isNaN(item.id)) {
        refinedSubtitle += item.displayName;
      } else if (item.id.indexOf('_') < 0 && !isNaN(item.id)) {
        refinedSubtitle += item.displayName;
      } else {
        if (subTitleFunction[item.id]) {
          refinedSubtitle += subTitleFunction[item.id]() + ' ';
        } else {
          refinedSubtitle += item.displayName;
        }
      }
    });

    return refinedSubtitle;
  }

  getVisualizationFiltersFromFavorite(favorite: any) {
    const filters: any[] = [];
    if (favorite) {
      if (favorite.mapViews) {
        favorite.mapViews.forEach((view: any) => {
          const filterObject: any = {
            id: view.id,
            filters: []
          };

          /**
           * Get filters
           */
          filterObject.filters.push(this._getDimensionValues(view.rows, view.dataElementDimensions));
          filterObject.filters.push(this._getDimensionValues(view.columns, view.dataElementDimensions));
          filterObject.filters.push(this._getDimensionValues(view.filters, view.dataElementDimensions));

          /**
           * Compile filters
           * @type {any[]}
           */
          filterObject.filters = this._compileDimensionFilters(filterObject.filters);

          filters.push(filterObject);
        });

      } else {
        const filterObject: any = {
          id: favorite.id,
          filters: []
        };

        /**
         * Get filters
         */
        filterObject.filters.push(this._getDimensionValues(favorite.rows, favorite.dataElementDimensions));
        filterObject.filters.push(this._getDimensionValues(favorite.columns, favorite.dataElementDimensions));
        filterObject.filters.push(this._getDimensionValues(favorite.filters, favorite.dataElementDimensions));

        /**
         * Compile filters
         * @type {any[]}
         */
        filterObject.filters = this._compileDimensionFilters(filterObject.filters);


        /**
         * Save result to the filter array
         */
        filters.push(filterObject)
      }
    }

    return filters;
  }

  private _getOptionsFromDimensions(dataDimensions) {
    if (dataDimensions) {

    }
    return []
  }

  private _getReadableDimensionValue(dimensionArray: any, readableDimensionValues: any) {
    if (dimensionArray) {
      dimensionArray.forEach((dimensionObject: any) => {
        if (dimensionObject.dimension !== 'dy') {
          if (dimensionObject.items) {
            readableDimensionValues[dimensionObject.dimension] = dimensionObject.items.map(item => {
              return {
                id: item.dimensionItem,
                name: item.displayName,
                itemType: item.dimensionItemType
              }
            });
          }
        }
      });
    }

    return readableDimensionValues;
  }

  private _getDimensionValues(dimensionArray: any, dataDimensions: any) {
    const dimensionValues: any[] = [];
    const newDataDimensions: any[] = _.map(dataDimensions, (dataDimension: any) => dataDimension.dataElement);
    const readableDimensionValues: any = {};
    if (dimensionArray) {
      dimensionArray.forEach((dimensionObject: any) => {
        if (dimensionObject.dimension !== 'dy') {

          const dimensionValue = {
            name: '',
            value: '',
            items: []
          };

          const currentDataDimension: any = _.find(newDataDimensions, ['id', dimensionObject.dimension]);

          if (currentDataDimension) {
            dimensionValue['options'] = currentDataDimension.optionSet ? currentDataDimension.optionSet.options : [];
          }

          /**
           * Get dimension name
           */
          let dimensionName = dimensionObject.dimension;
          dimensionName += dimensionObject.legendSet ? '-' + dimensionObject.legendSet.id : '';
          dimensionValue.name = dimensionName;

          /**
           * Get dimension items
           */
          dimensionValue.items = dimensionObject.items;

          /**
           * Get dimension value
           */
          if (dimensionObject.items) {
            readableDimensionValues[dimensionObject.dimension] = dimensionObject.items.map(item => {
              return {
                id: item.dimensionItem,
                name: item.displayName,
                itemType: item.dimensionItemType
              }
            });

            const itemValues = dimensionObject.items.map(item => {
              return item.dimensionItem ? item.dimensionItem : ''
            }).join(';')
            dimensionValue.value = itemValues !== '' ? itemValues : dimensionObject.filter ? dimensionObject.filter : '';
          }
          dimensionValues.push(dimensionValue)
        }
      });
    }

    return dimensionValues;
  }

  private _compileDimensionFilters(filters) {
    const compiledFilters: any[] = [];
    if (filters) {
      filters.forEach((filter: any) => {
        filter.forEach(filterValue => {
          compiledFilters.push(filterValue)
        })
      })
    }
    return compiledFilters;
  }

  getVisualizationLayoutFromFavorite(favorite: any) {
    const layouts: any[] = [];
    if (favorite) {
      if (favorite.mapViews) {
        favorite.mapViews.forEach(view => {
          const layout = {
            rows: this._getDimensionLayout(view.rows, view.dataElementDimensions),
            columns: this._getDimensionLayout(view.columns, view.dataElementDimensions),
            filters: this._getDimensionLayout(view.filters, view.dataElementDimensions)
          }
          layouts.push({id: view.id, layout: layout})
        })
      } else {
        const layout = {
          // todo add flexibility for attributesDimensions and programIndicatorDimensions
          rows: this._getDimensionLayout(favorite.rows, favorite.dataElementDimensions),
          columns: this._getDimensionLayout(favorite.columns, favorite.dataElementDimensions),
          filters: this._getDimensionLayout(favorite.filters, favorite.dataElementDimensions)
        }
        layouts.push({id: favorite.id, layout: layout})
      }
    }
    return layouts;
  }

  getVisualizationInterpretationFromFavorite(favorite: any) {
    const interpretations: any[] = [];
    if (favorite) {
      if (favorite.mapViews) {
        favorite.mapViews.forEach(view => {
          interpretations.push({id: view.id, interpretations: view.interpretations})
        })
      } else {

        interpretations.push({id: favorite.id, interpretations: favorite.interpretations})
      }
    }
    return interpretations
  }

  private _getDimensionLayout(dimensionArray, dataElementDimensions) {
    const newDimensionLayoutArray: any[] = [];
    if (dimensionArray) {
      dimensionArray.forEach(dimensionObject => {
        if (dimensionObject.dimension !== 'dy') {
          const layoutValue = dimensionObject.dimension;
          const layoutName = this._getLayoutName(layoutValue, dataElementDimensions);
          newDimensionLayoutArray.push({name: layoutName, value: layoutValue});
        }
      })
    }
    return newDimensionLayoutArray;
  }

  private _getLayoutName(layoutValue, dataElementDimensions) {
    switch (layoutValue) {
      case 'ou': {
        return 'Organisation Unit'
      }

      case 'pe': {
        return 'Period'
      }

      case 'dx': {
        return 'Data'
      }

      default: {
        let layoutName = '';
        if (dataElementDimensions) {
          const compiledDimension = dataElementDimensions.map(dataElementDimension => {
            return dataElementDimension.dataElement
          });
          const layoutObject = _.find(compiledDimension, ['id', layoutValue]);
          if (layoutObject) {
            layoutName = layoutObject.name;
          }
        }
        return layoutName !== '' ? layoutName : 'Category Option';
      }
    }

  }

  getFavoriteOptions(apiRootUrl) {
    return Observable.of([])
    // return Observable.create(observer => {
    //   this.http.get(apiRootUrl + 'dataStore/idashboard/favoriteOptions').subscribe((favoriteOptions: any) => {
    //     observer.next(favoriteOptions);
    //     observer.complete();
    //   }, () => {
    //     observer.next([]);
    //     observer.complete();
    //   })
    // })
  }

  loadAdditionalOptions(visualizationDetails) {
    const favoriteId = visualizationDetails.favorite.id;
    return Observable.create(observer => {
      if (favoriteId) {
        this.http.get(visualizationDetails.apiRootUrl + 'dataStore/favoriteOptions/' + visualizationDetails.favorite.id)
          .subscribe(favoriteOptions => {
            visualizationDetails.favorite = Object.assign({}, visualizationDetails.favorite, favoriteOptions);
            observer.next(visualizationDetails);
            observer.complete();
          }, () => {
            observer.next(visualizationDetails);
            observer.complete();
          })
      } else {
        observer.next(visualizationDetails);
        observer.complete();
      }
    });
  }

  private _updateAdditionalOptions(visualizationDetails) {
    const favoriteOptions = visualizationDetails.favoriteOptions;
    return Observable.create(observer => {
      if (favoriteOptions) {
        this.http.get(visualizationDetails.apiRootUrl + 'dataStore/idashboard/favoriteOptions')
          .subscribe((favoriteOptionsResponse: any[]) => {
            const availableFavoriteOptions = _.find(favoriteOptionsResponse, ['id', favoriteOptions.id]);

            if (availableFavoriteOptions) {
              const availableFavoriteOptionsIndex = _.findIndex(favoriteOptionsResponse, availableFavoriteOptions);
              favoriteOptionsResponse[availableFavoriteOptionsIndex] = favoriteOptions;
              this.http.put(visualizationDetails.apiRootUrl + 'dataStore/idashboard/favoriteOptions', favoriteOptionsResponse)
                .subscribe(() => {
                  observer.next(visualizationDetails);
                  observer.complete();
                }, () => {
                  observer.next(visualizationDetails);
                  observer.complete();
                });
            } else {
              favoriteOptionsResponse.push(favoriteOptions);
              this.http.put(visualizationDetails.apiRootUrl + 'dataStore/idashboard/favoriteOptions', favoriteOptionsResponse)
                .subscribe(() => {
                  observer.next(visualizationDetails);
                  observer.complete();
                }, () => {
                  observer.next(visualizationDetails);
                  observer.complete();
                })
            }
          }, () => {
            this.http.post(visualizationDetails.apiRootUrl + 'dataStore/idashboard/favoriteOptions', [favoriteOptions])
              .subscribe(() => {
                observer.next(visualizationDetails);
                observer.complete();
              }, () => {
                observer.next(visualizationDetails);
                observer.complete();
              })
          });
      } else {
        observer.next(visualizationDetails);
        observer.complete();
      }
    })
  }

  createOrUpdateFavorite(visualizationDetails: any) {
    return Observable.create(observer => {
      const visualizationSettings = visualizationDetails.visualizationObject.layers.map(layer => {
        return layer.settings
      });
      const additionalOptionsArray = this._prepareAdditionalFavoriteOptions(visualizationSettings);
      /**
       * Update favorites
       */
      Observable.forkJoin(
        visualizationSettings.map(setting => {
          return Observable.of(setting)
        })
      ).subscribe(() => {
        /**
         * Update additional options
         */
        Observable.forkJoin(
          additionalOptionsArray.map(option => {
            return this._updateAdditionalOptions({
              apiRootUrl: visualizationDetails.apiRootUrl,
              favoriteOptions: option
            })
          })
        ).subscribe(() => {
          visualizationDetails.updateSuccess = true;
          observer.next(visualizationDetails);
          observer.complete()
        }, error => {
          visualizationDetails.updateSuccess = false;
          visualizationDetails.updateError = error;
          observer.next(visualizationDetails);
          observer.complete()
        })
      }, favoriteError => {
        visualizationDetails.updateSuccess = false;
        visualizationDetails.updateError = favoriteError;
        observer.next(visualizationDetails);
        observer.complete()
      })
    })
  }

  private _prepareAdditionalFavoriteOptions(visualizationSettings) {
    const favoriteOptionArray: any[] = [];
    if (visualizationSettings) {
      visualizationSettings.forEach(visualizationSetting => {
        const favoriteOption: any = {
          id: visualizationSetting.id,
          useMultipleAxis: visualizationSetting.useMultipleAxis,
          selectedChartTypes: visualizationSetting.selectedChartTypes
        };

        favoriteOptionArray.push(favoriteOption)
      })
    }
    return favoriteOptionArray
  }

  splitFavorite(favorite: any, splitCriterias: any[]) {
    const favoriteArray: any[] = [];
    let favoriteRows: any[] = [];
    let favoriteColumns: any[] = [];
    let favoriteFilters: any[] = [];

    if (favorite) {
      favoriteRows = [favorite.rows];
      favoriteColumns = [favorite.columns];
      favoriteFilters = [favorite.filters];
      splitCriterias.forEach(criteria => {
        favoriteRows = this.splitDimensionLayout(favoriteRows, criteria);
        favoriteColumns = this.splitDimensionLayout(favoriteColumns, criteria);
        favoriteFilters = this.splitDimensionLayout(favoriteFilters, criteria);
      })
    }

    let favoriteIndex: number = 0;
    favoriteRows.forEach(row => {
      favoriteColumns.forEach(column => {
        favoriteFilters.forEach(filter => {
          const favoriteObject: any = _.clone(favorite);
          //function to rename
          favoriteObject.rows = row;
          favoriteObject.columns = column;
          favoriteObject.filters = filter;
          favoriteObject.id = favoriteObject.id + '_' + favoriteIndex;
          favoriteObject.name = this._getFavoriteName([row, column, filter]);
          favoriteObject.displayName = favoriteObject.name;
          favoriteObject.analyticsIdentifier = this._getAnalyticsIdentifier([row, column, filter], splitCriterias);
          favoriteObject.layer = 'thematic' + (favoriteIndex + 1);
          favoriteArray.push(favoriteObject);
          favoriteIndex++;
        })
      })
    });


    return favoriteArray;
  }

  private _getAnalyticsIdentifier(dimensions: any[], criterias) {
    let identifier = '';
    if (dimensions) {
      dimensions.forEach(dimensionItem => {
        criterias.forEach(criteria => {
          const dimensionArray = _.find(dimensionItem, ['dimension', criteria]);

          if (dimensionArray) {
            dimensionArray.items.forEach(item => {
              identifier += identifier !== '' ? '_' + item.id : item.id;
            })
          }
        });
      })
    }
    return identifier;
  }

  private _getFavoriteName(dimensions: any[]) {
    let favoriteName = '';
    if (dimensions) {
      dimensions.forEach(dimensionItem => {
        const dataArray = _.find(dimensionItem, ['dimension', 'dx']);

        if (dataArray) {
          dataArray.items.forEach(item => {
            favoriteName += item.displayName;
          })
        }

      })

      dimensions.forEach(dimensionItem => {
        const periodArray = _.find(dimensionItem, ['dimension', 'pe']);

        if (periodArray) {
          periodArray.items.forEach(item => {
            favoriteName += favoriteName !== '' ? ' - ' + item.displayName : item.displayName;
          })
        }

      })
    }

    return favoriteName;
  }

  splitDimensionLayout(layoutDetailsArray, criteria) {
    const criteriaArray: any[] = [];
    const splitedArray: any[] = [];
    if (layoutDetailsArray) {
      layoutDetailsArray.forEach(layoutDetail => {
        layoutDetail.forEach(detail => {
          if (detail.dimension === criteria) {
            const items: any[] = _.clone(detail.items);
            if (items) {
              items.forEach(item => {
                criteriaArray.push([{
                  dimension: detail.dimension,
                  items: [item]
                }]);
              });
            }
          }
        });

        criteriaArray.forEach(array => {
          array.forEach(criteriaObject => {
            const newArray: any[] = [];
            layoutDetail.forEach(nonCriteriaDetail => {
              if (nonCriteriaDetail.dimension !== criteria) {
                newArray.push(nonCriteriaDetail)
              }
            });

            const concatArray = _.concat(newArray, criteriaObject);
            splitedArray.push(concatArray)
          })

        })

      });
    }
    return splitedArray.length > 0 ? splitedArray : layoutDetailsArray;
  }

  mergeFavorite(splitedFavorite) {
    let rows: any[] = [];
    let columns: any[] = [];
    let filters: any[] = [];
    let mergedFavorite: any = {};
    if (splitedFavorite) {
      splitedFavorite.forEach((favorite: any) => {
        if (!mergedFavorite.id) {
          const favoriteId: string = favorite.id;
          const underScoreIndex: number = favoriteId.indexOf('_');
          mergedFavorite = favorite;
          if (underScoreIndex !== -1) {
            mergedFavorite.id = favoriteId.substring(0, underScoreIndex - 1);
          }
        }
        /**
         * merge rows
         */
        rows = this.mergeDimensionLayout(_.clone(favorite.rows), rows);

        /**
         * merge columns
         */
        columns = this.mergeDimensionLayout(_.clone(favorite.columns), columns);

        /**
         * merge filters
         */
        filters = this.mergeDimensionLayout(_.clone(favorite.filters), filters);
      })
    }

    mergedFavorite.rows = this.mergeToCorrepondingDimension(rows);
    mergedFavorite.columns = this.mergeToCorrepondingDimension(columns);
    mergedFavorite.filters = this.mergeToCorrepondingDimension(filters);

    return mergedFavorite;
  }

  mergeDimensionLayout(layoutArray, layoutResult) {
    /**
     * prepare arrays for checking duplicate
     * @type {Array}
     */
    let resultItems: any[] = [];
    layoutResult.forEach(result => {
      result.items.forEach(resultItem => {
        resultItems.push(resultItem);
      })
    });

    /**
     * Update array with new items
     */
    if (layoutArray) {
      layoutArray.forEach(result => {
        const layoutItems: any[] = _.clone(result.items);
        layoutItems.forEach(item => {
          const existingItem = _.find(resultItems, ['id', item.id]);
          if (!existingItem) {
            layoutResult.push(result)
          }
        });
      })
    }
    return layoutResult;
  }

  mergeToCorrepondingDimension(layoutResult) {
    let newLayoutResult: any = [];
    layoutResult.forEach(result => {
      if (newLayoutResult.length === 0) {
        newLayoutResult.push(result);
      } else {
        const currentDimensionObject = _.find(newLayoutResult, ['dimension', result.dimension]);
        const currentDimensionIndex = _.findIndex(newLayoutResult, currentDimensionObject);
        if (currentDimensionObject) {
          let newItemList: any = [];

          /**
           * Get list from current array
           */
          const arrayItems: any[] = result.items;
          if (arrayItems) {
            arrayItems.forEach(item => {
              newItemList.push(item);
            });
          }
          ;

          /**
           * Add more item list from already added list
           */
          const existingItems = newLayoutResult[currentDimensionIndex].items;
          if (existingItems) {
            existingItems.forEach(item => {
              newItemList.push(item);
            });
          }

          newLayoutResult[currentDimensionIndex].items = newItemList;


        } else {
          newLayoutResult.push(result);
        }
      }
    });
    return newLayoutResult;
  }

}
