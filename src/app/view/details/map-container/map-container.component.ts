import {Component, Input, OnInit} from '@angular/core';
import * as visualizationUtils from './visualization-utils';
import {HttpClientService} from '../../../shared/services/http-client.service';

@Component({
  selector: 'app-map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.css']
})
export class MapContainerComponent implements OnInit {

  @Input() analyticsObject: any = null;
  @Input() current_title: any = null;
  visualizationObject: any;
  constructor(private httpClient: HttpClientService) { }

  ngOnInit() {
    const initialVisualizationObject: any =  visualizationUtils.loadInitialVisualizationObject({id: 'scorecard_map', type: 'MAP'});


    const orgUnitArray = this.analyticsObject ? this.analyticsObject.metaData.ou : [];

    this.visualizationObject = {...initialVisualizationObject, layers: [{settings: {}, analytics: this.analyticsObject}]};

    this.httpClient.get(this._getGeoFeatureUrl('', this._getGeoFeatureParams(orgUnitArray.join(';'))))
      .subscribe((geoFeatures: any) => {
        this.visualizationObject = {
          ...this.visualizationObject,
          name: this.current_title,
          details: {
            ...this.visualizationObject.details,
            loaded: true,
          mapConfiguration: this._getMapConfiguration(this.visualizationObject)},
          layers: [...this.visualizationObject.layers.map((layer) => {
            return {...layer, settings: {...layer.settings, geoFeature: geoFeatures, layer: 'thematic1'}};
          })]
        };
      }, error => {
        this.visualizationObject = {
          ...this.visualizationObject,
          details: {...this.visualizationObject.details, loaded: true, hasError: true, errorMessage: error}
        };
      });
  }

  private _getGeoFeatureParams(orgUnitFilterValue: any) {
    return orgUnitFilterValue !== '' ? 'ou=ou:' + orgUnitFilterValue : '';
  }

  private _getGeoFeatureUrl(apiRootUrl: string, geoFeatureParams: string) {
    return geoFeatureParams !== '' ?
      apiRootUrl + 'geoFeatures.json?' + geoFeatureParams + '&displayProperty=NAME&includeGroupSets=true' : '';
  }

  private _getMapConfiguration(visualizationObject: any): {
    id: string;
    basemap: string;
    name: string;
    subtitle: string;
    zoom: number;
    latitude: string;
    longitude: string;

  } {
    return {
      id: visualizationObject.id,
      name: visualizationObject.name,
      subtitle: visualizationObject.subtitle,
      basemap: visualizationObject.details.hasOwnProperty('basemap') && visualizationObject.details.basemap ? visualizationObject.details.basemap : 'osmlight',
      zoom: visualizationObject.details.hasOwnProperty('zoom') ? visualizationObject.details.zoom : 0,
      latitude: visualizationObject.details.hasOwnProperty('latitude') ? visualizationObject.details.latitude : 0,
      longitude: visualizationObject.details.hasOwnProperty('longitude') ? visualizationObject.details.longitude : 0
    };
  }

}
