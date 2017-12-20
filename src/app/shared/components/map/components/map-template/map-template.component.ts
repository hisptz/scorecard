import {Component, Input, OnInit, ViewChild} from '@angular/core';
import 'leaflet';
import 'leaflet.markercluster';
import {MapVisualizationService} from '../../providers/map-visualization.service';
import {TileLayers} from '../../constants/tile-layers';

declare var L;
import * as _ from 'lodash';
import {VisualizationLegendComponent} from '../visualization-legend/visualization-legend.component';
import {Visualization} from '../../model/visualization';

@Component({
  selector: 'app-map-template',
  templateUrl: './map-template.component.html',
  styleUrls: ['./map-template.component.css'],
})
export class MapTemplateComponent implements OnInit {
  @Input() visualizationObject: any;
  @Input() mapHeight: string;
  loading: boolean = true;
  hasError: boolean = false;
  errorMessage: string;
  legendIsOpen: boolean = false;
  mapWidth: any = '100%';
  map: any = {};
  centeringLayer: any;
  mapLegend: any;
  legendMarginRight = '25px';
  legendMarginLeft = '200px';
  subtitle: string = '';
  pinned: boolean = false;
  operatingLayers: Array<any> = [];
  isFullScreen: boolean = false;
  hideTable: boolean = true;
  mapOptions: any;
  mapTable: any = {headers: [], rows: [], mapLegend: this.mapLegend};
  @ViewChild(VisualizationLegendComponent)
  visualizationLegendComponent: VisualizationLegendComponent;

  constructor(private mapVisualizationService: MapVisualizationService,
              private tileLayers: TileLayers) {
  }

  ngOnInit() {
    if (this.visualizationObject.details.loaded) {
      if (!this.visualizationObject.details.hasError) {
        setTimeout(() => {
          this.visualizationObject = this.getSubtitle(this.visualizationObject);
          this.mapHeight = this.refineHeight(this.visualizationObject.details.itemHeight);
          this.drawMap(this.visualizationObject, this.visualizationObject.details.updateAvailable);
        }, 10);
        //     this.hasError = false;
      } else {
        this.hasError = true;
        // this.loading = false;
        this.errorMessage = this.visualizationObject.details.errorMessage;
      }
    }
  }


  drawMap(visualizationObject: Visualization, prioritizeFilter?: boolean) {
    const mapObject = this.mapVisualizationService.drawMap(L, visualizationObject, prioritizeFilter);
    const container = this.prepareMapContainer(mapObject.id, this.mapHeight, this.mapWidth, this.isFullScreen);
    this.mapOptions = mapObject.options;
    this.map = L.map(container, mapObject.options);
    this.centeringLayer = mapObject.centeringLayer;
    this.mapLegend = mapObject.mapLegend;
    this.operatingLayers = mapObject.operatingLayers;
    L.control.scale({position: 'bottomleft', metric: true, updateWhenIdle: true}).addTo(this.map);
    this.updateOnLayerLoad(mapObject);
    this.isFullScreen = visualizationObject.details.showFullScreen;
    if (this.isFullScreen === true) {
      this.map.scrollWheelZoom.enable();
    }

  }

  recenterMap(map, layer) {

    if (layer instanceof L.LayerGroup) {
      if (layer.getLayers().length === 2) {
        layer = layer.getLayers()[0];
      }
    }


    const bounds = Array.isArray(layer) ? new L.LatLngBounds(layer) : layer.getBounds();
    if (this._checkIfValidCoordinate(bounds)) {
      try {
        map.fitBounds(bounds);
      } catch (e) {
      }

    } else {
      this.hasError = true;
      this.errorMessage = 'Invalid organisation unit boundaries found!';
    }

  }

  /**
   * Update map Zoom Level
   * */
  zoomIn(zoomType) {
    zoomType === 'in' ? this.map.zoomIn() :
      zoomType === 'out' ? this.map.zoomOut() :
        this.map.setZoom(this.mapOptions.zoom);
  }

  updateOnLayerLoad(mapObject) {
    if (Array.isArray(this.centeringLayer)) {
      this.loading = false;
      setTimeout(() => {
        this.map.invalidateSize({pan: true});
        this.recenterMap(this.map, mapObject.centeringLayer);
      }, 10);
    } else {
      if (this.map.hasLayer(this.centeringLayer)) {
        this.loading = false;
        setTimeout(() => {
          this.map.invalidateSize({pan: true});
          this.recenterMap(this.map, mapObject.centeringLayer);
        }, 10);

      }
    }

  }

  getSubtitle(visualizationObject) {
    const layers = visualizationObject.layers;
    layers.forEach(layer => {
      if (layer.settings.subtitle) {
        visualizationObject['subtitle'] = layer.settings.subtitle;
      }
    })
    return visualizationObject;
  }

  private _checkIfValidCoordinate(bounds) {

    const boundLength = Object.getOwnPropertyNames(bounds).length;
    if (boundLength > 0) {
      return true;
    } else {
      return false;
    }
  }

  prepareMapContainer(mapObjectId, height, width, isFullscreen) {
    const parentElement = document.getElementById('map-view-port-' + mapObjectId);
    const mapContainer = document.getElementById(mapObjectId + '-child-view-port');
    if (mapContainer) {
      mapContainer.parentNode.removeChild(mapContainer);
    }
    const div = document.createElement('div');
    div.setAttribute('id', mapObjectId + '-child-view-port');
    if (isFullscreen) {
      width = '100%';
      // height = '81vh';
    }
    div.style.width = width;
    div.style.height = height;console.log(height)
    if (parentElement) {
      parentElement.appendChild(div);
    }
    return mapObjectId + '-child-view-port';
  }

  toggleLegendContainerView() {
    if (this.legendIsOpen || !this.legendIsOpen) {
      this.legendIsOpen = true;
    }
  }

  changeMapTileLayer(event) {
    if (event.active) {
      this.visualizationObject.details.mapConfiguration.basemap = event.name;
    } else {
      this.visualizationObject.details.mapConfiguration.basemap = null;
    }
    this.drawMap(this.visualizationObject);
  }

  updateMapLayers(event) {
    let layerActedUpon: any = null;
    this.operatingLayers.forEach(layer => {

      const layerIdentifier = event.layer.id ? event.layer.id : event.layer.name;

      if (layer[layerIdentifier]){
        layerActedUpon = layer[layerIdentifier];
      }
    })

    if (event.layer.hasOwnProperty('url')) {
      layerActedUpon = this.mapVisualizationService.prepareTileLayer(L, this.tileLayers.getTileLayer(event.layer.name));
    }


    if (layerActedUpon) {
      if (event.action === 'HIDE') {

        layerActedUpon.removeFrom(this.map);
        this.map.removeLayer(layerActedUpon);
      }

      if (event.action === 'SHOW') {
        this.map.addLayer(layerActedUpon);
      }

    }

  }

  stickyMapLegend(event) {
    this.pinned = event;
  }

  downloadMapAsFiles(event) {
    const fileFormat = event.format;
    let data = event.data;
    if (fileFormat === 'image') {
      data = this.map.getContainer();
    }
    this.mapVisualizationService.downLoadMapAsFiles(fileFormat, data);
  }

  downloadMap(fileFormat) {
    this.mapVisualizationService.downLoadMapAsFiles(fileFormat, this.visualizationObject);
  }

  processFileUpload(event) {
    if (event.hasOwnProperty('type') && event.type == 'FeatureCollection') {
      this.drawUploadedlLayer(this.mapVisualizationService.prepareGeoJsonLayerFromFileContents(event, L));
    } else {
      console.log('THIS IS NOT VALID GEOJSON FILE');
    }
  }

  drawUploadedlLayer(layer) {
    this.map.addLayer(layer);
  }

  closeMapLegend(flag) {
    if (flag === 'leave' && !this.pinned) {
      this.legendIsOpen = false;
    }

    if (!flag) {
      this.pinned = false;
      this.legendIsOpen = false;
    }

  }

  dragAndDropHandler(event) {
    const newVisualizationObject = this.visualizationObject;
    const layers = newVisualizationObject.layers;
    newVisualizationObject.layers = this.sortLayers(layers, event);
    this.drawMap(this.visualizationObject);
  }

  sortLayers(layers, eventLayers) {
    const newLayers = [];
    const testlayers = [];

    eventLayers.forEach((event, eventIndex) => {
      layers.forEach((layer, layerIndex) => {
        if (event.id === layer.settings.id) {
          newLayers[eventIndex] = layer;
          testlayers.push(layer.settings.name)
        }
      })
    })
    return newLayers;
  }

  drawMapDataTable(event) {
    let layers = event.visualizationObject.layers;
    let legendClasses = null;

    event.legend.forEach(legendItem => {
      legendClasses = legendItem.classes;
    })

    this.hideTable = false;
    this.mapTable.headers = this.prepareTableHeaders(layers);
    this.mapTable.rows = this.prepareTableRows(layers, legendClasses);
  }

  addNewLayer() {
  }

  refineHeight(mapHeight) {

    let height = '';
    if (mapHeight.indexOf('vh') >= 0) {
      const splitMap = mapHeight.split('vh');
      height = ((+splitMap[0]) + 7) + 'vh';
    }

    if (mapHeight.indexOf('px') >= 0) {

      const splitMap = mapHeight.split('px');
      height = ((+splitMap[0]) + 25) + 'px';
    }
    return height;
  }

  hideDataTable() {
    this.hideTable = true;
  }

  prepareTableHeaders(layers) {

    const headers: any = [];
    layers.forEach((layer, index) => {
      if (layer.analytics && layer.analytics.hasOwnProperty('headers')) {
        headers.push(layer.settings.name + '$' + index);
      }
    });
    return headers;
  }

  prepareTableRows(layers, legendClasses) {
    const rowArray = {};
    layers.forEach((layer, index) => {
      const rows = [];
      if (layer.analytics && layer.analytics.hasOwnProperty('headers')) {
        const headers = layer.analytics.headers;
        const names = layer.analytics.metaData.names;
        const indexOU = _.findIndex(layer.analytics.headers, ['name', 'ou']);
        const indexVal = _.findIndex(layer.analytics.headers, ['name', 'value']);
        layer.analytics.rows.forEach(row => {
          const columns = [];
          columns.push(names[row[indexOU]]);
          columns.push(row[indexVal]);
          let classItem = this._getClassItem(legendClasses, row[indexVal]);
          columns.push(classItem.min + ' - ' + classItem.max);
          columns.push(classItem.color);
          rows.push(columns);
        })
        rowArray[layer.settings.name + '$' + index] = rows;
      }
    })
    return rowArray;
  }

  private _getClassItem(legendClasses, value): any {
    let legendItem: any = null;
    legendClasses.forEach(classItem => {
      if (classItem.min <= value && classItem.max > value) {
        legendItem = classItem;
      }

      if (classItem.max <= value) {
        legendItem = classItem;
      }

    })

    return legendItem;
  }
}
