import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';
import {FavoriteService} from './favorite.service';
import {HttpClientService} from './http-client.service';

@Injectable()
export class GeoFeatureService {

  constructor(
    private http: HttpClientService,
    private favoriteService: FavoriteService
  ) { }

  getGeoFeature1(apiRootUrl: string, orgUnitFilterValues: any): Observable<any[]> {
    const geoFeatureUrl = this._getGeoFeatureUrl(apiRootUrl, this._getGeoFeatureParams(orgUnitFilterValues));
    return geoFeatureUrl ? this.http.get(geoFeatureUrl) : Observable.of(null);
  }

  private _getGeoFeatureParams(orgUnitFilterValue: any) {
    return orgUnitFilterValue !== '' ? 'ou=ou:' + orgUnitFilterValue : '';
  }


  getGeoFeature(visualizationDetails: any) {
    const apiRootUrl = visualizationDetails.apiRootUrl;
    // const visualizationFilters = visualizationDetails.visualizationObject.details.filters;
    const visualizationFilters = visualizationDetails.visualizationObject.layers.map(layer => {
      const filterDetails: any = this.favoriteService.getVisualizationFiltersFromFavorite({favorite: layer.settings});

      let filters = [];
      let newFilter = null;
      if (filterDetails.filters) {
        filters = filterDetails.filters;
        filters.forEach(filter => { newFilter = filter});
      }
      return newFilter;
    });

    const geoFeatureParametersArray = this._getGeoFeatureParametersArray(visualizationFilters.map(filterObject => { return _.find(filterObject.filters, ['name', 'ou'])}));
    return Observable.create(observer => {
      if (geoFeatureParametersArray === []) {
        observer.next(visualizationDetails);
        observer.complete();
      } else {
        Observable.forkJoin(
          geoFeatureParametersArray.map(geoFeatureParam => {
            return geoFeatureParam !== '' ? this.http.get(this._getGeoFeatureUrl(apiRootUrl, geoFeatureParam)) : Observable.of([])
          })
        )
          .subscribe(geoFeatures => {
            const newGeoFeatures = [];
            visualizationFilters.forEach((filterObject, filterIndex) => {
              newGeoFeatures.push({
                id: filterObject.id,
                content: geoFeatures[filterIndex]
              })
            });
            visualizationDetails.geoFeatures = newGeoFeatures;
            observer.next(visualizationDetails);
            observer.complete();
          }, error => observer.error(error))
      }
    })
  }
  private _getGeoFeatureParametersArray(visualizationOrgUnitArray) {
    return visualizationOrgUnitArray.map(orgUnitObject => { return orgUnitObject && orgUnitObject.value !== '' ? 'ou=ou:' + orgUnitObject.value : ''});
  }

  private _getGeoFeatureUrl(apiRootUrl: string, geoFeatureParams: string) {
    return geoFeatureParams !== '' ?
      apiRootUrl + 'geoFeatures.json?' + geoFeatureParams + '&displayProperty=NAME&includeGroupSets=true' : '';
  }

}
