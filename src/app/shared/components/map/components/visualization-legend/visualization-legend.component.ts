import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Inject} from '@angular/core';
import * as _ from 'lodash';
import {LegendSet} from '../../model/legend-set';
import {LegendSetService} from '../../providers/legend-set.service';
import {TILE_LAYERS} from '../../constants/tile-layers';
import {MapLayerEvent} from '../../constants/layer-event';
declare var shp;
@Component({
  selector: 'app-visualization-legend',
  templateUrl: 'visualization-legend.component.html',
  styleUrls: ['visualization-legend.component.css']
})
export class VisualizationLegendComponent implements OnInit {
  @Input() mapVsualizationObject: any;
  @Output() changeMapTileLayer: EventEmitter<any> = new EventEmitter();
  @Output() closeLegend: EventEmitter<any> = new EventEmitter();
  @Output() downloadMapAsFiles: EventEmitter<any> = new EventEmitter();
  @Output() updateMapLayers: EventEmitter<any> = new EventEmitter();
  @Output() layerDnDAction: EventEmitter<any> = new EventEmitter();
  @Output() showDataTable: EventEmitter<any> = new EventEmitter();
  @Output() stickyLegend: EventEmitter<any> = new EventEmitter();
  @Output() newLayerEvent: EventEmitter<any> = new EventEmitter();
  @Output() fileUploadEvent: EventEmitter<any> = new EventEmitter();
  @ViewChild('fileInputForm') fileInputForm: ElementRef;
  visualizationLegends: LegendSet[] = [];
  visualizationTileLayersLegends: any[];
  openTileLegend: boolean = false;
  sticky: boolean = false;
  isRemovable: boolean = false;
  toggleBoundary: boolean = true;
  boundaryLegend: Array<any> = [];
  showDownload: boolean = false;
  showUpload: boolean = false;
  showButtonIncons: boolean = false;
  layerSelectionForm: boolean = false;
  showTransparent: boolean = false;
  displayNone: boolean = false;
  private baseHref = '../../../';


  constructor(private legend: LegendSetService) {
  }

  ngOnInit() {
    const eventLegends = [];
    const thematicLegends = [];
    const boundaryLegends = [];
    const facilityLegends = [];
    if (this.mapVsualizationObject.type === 'MAP' || this.mapVsualizationObject.type === 'REPORT_TABLE' || this.mapVsualizationObject.type === 'CHART' || this.mapVsualizationObject.type === 'EVENT_REPORT' || this.mapVsualizationObject.type === 'EVENT_CHART') {
      const mapLayers = this.mapVsualizationObject.layers;
      this.visualizationTileLayersLegends = this.legend.prepareTileLayers(TILE_LAYERS);
      mapLayers.forEach((mapLayer, mapLayerIndex) => {
          const mapVisualizationSettings = mapLayer.settings;
          const mapVisualizationAnalytics = mapLayer.analytics;
          if (mapLayer.settings.layer === 'boundary') {
            this.legend.boundaryLayerLegendClasses(mapVisualizationSettings, mapVisualizationAnalytics).subscribe((classess) => {
              this.boundaryLegend.push(this._prepareLayerLegend(mapVisualizationSettings, mapVisualizationAnalytics, classess));
              boundaryLegends.push(this._prepareLayerLegend(mapVisualizationSettings, mapVisualizationAnalytics, classess));
            });
          }

          if (mapLayer.settings.layer === 'event') {
            eventLegends.push(this._prepareLayerLegend(mapVisualizationSettings, mapVisualizationAnalytics, this.legend.prepareEventLayerLegendClasses(mapVisualizationSettings, mapVisualizationAnalytics)))
          }

          if (mapLayer.settings.layer.indexOf('thematic') > -1) {

            thematicLegends.push(this._prepareLayerLegend(mapVisualizationSettings, mapVisualizationAnalytics, this.legend.prepareThematicLayerLegendClasses(mapVisualizationSettings, mapVisualizationAnalytics)));

          }

          if (mapLayer.settings.layer.indexOf('facility') > -1) {

            facilityLegends.push(this._prepareLayerLegend(mapVisualizationSettings, mapVisualizationAnalytics, this.legend.getFacilityLayerLegendClasses(mapVisualizationSettings, true)));

          }

        }
      )

      this.visualizationLegends = [...thematicLegends, ...eventLegends, ...boundaryLegends, ...facilityLegends];
    }

    this.visualizationLegends.forEach((legend, legendIndex) => {
      legendIndex === 0 ? legend.opened = true : legend.opened = false;
    })

  }


  private _prepareLayerLegend(mapVisualizationSettings, mapVisualizationAnalytics, legendClasses) {
    let legendId = '';
    if (mapVisualizationAnalytics && mapVisualizationAnalytics.metaData) {
      mapVisualizationSettings.subtitle = ''; // !mapVisualizationSettings.subtitle ? '' : mapVisualizationSettings.subtitle;
      mapVisualizationAnalytics.metaData.pe.forEach(period => {
        mapVisualizationSettings.subtitle += mapVisualizationAnalytics.metaData.names[period];
        legendId = mapVisualizationSettings.id;
      })
    }

    const hiddenProperty: any = (new Function('return ' + localStorage.getItem(legendId)))();
    const layerLegend: LegendSet = {
      id: mapVisualizationSettings.id,
      name: mapVisualizationSettings.layer === 'event' ? this.legend.getEventName(mapVisualizationAnalytics)[0] :
        mapVisualizationSettings.layer === 'boundary' ? 'Boundaries' : mapVisualizationSettings.layer === 'facility' ? 'Facility' : mapVisualizationSettings.name,
      description: mapVisualizationSettings.subtitle,
      pinned: false,
      hidden: hiddenProperty ? hiddenProperty : false,
      opened: false,
      isClustered: false,
      useIcons: false,
      isEvent: mapVisualizationSettings.layer === 'event' ? true : false,
      isThematic: mapVisualizationSettings.layer != 'event' && mapVisualizationSettings.layer != 'boundary' && mapVisualizationSettings.layer != 'facility' ? true : false,
      isBoundary: mapVisualizationSettings.layer === 'boundary' ? true : false,
      isFacility: mapVisualizationSettings.layer === 'facility' ? true : false,
      opacity: mapVisualizationSettings.opacity,
      classes: mapVisualizationSettings.layer != 'boundary' && mapVisualizationSettings.layer != 'facility' ? legendClasses : legendClasses,
      change: []
    }


    return layerLegend;
  }

  dragAndDropActions(visualizationLegends) {
    this.layerDnDAction.emit(visualizationLegends);
  }

  changeTileLayer(tileLegend) {
    let checked = 0;

    this.visualizationTileLayersLegends.forEach(tileLegendLoop => {

      if (tileLegendLoop.active && tileLegend.name === tileLegendLoop.name) {
        tileLegendLoop.active = false;
        this.updateMapLayer(tileLegendLoop, 'HIDE');
        checked++;
      } else if (!tileLegendLoop.active && tileLegend.name === tileLegendLoop.name && checked < 1) {
        tileLegendLoop.active = true;
        this.updateMapLayer(tileLegendLoop, 'SHOW');
      } else {
        tileLegendLoop.active = false;
      }
    })
  }

  updateMapLayer(layer, action) {
    localStorage.setItem(layer.id, layer.hidden);
    const EVENT: MapLayerEvent = this.legend.prepareLayerEvent(layer, action);
    this.updateMapLayers.emit(EVENT);
  }

  showDownloadContainer() {
    this.showTransparent = false;
    this.showDownload = !this.showDownload;
    this.displayNone = true;
  }

  showUploadContainer() {
    this.showUpload = true;
    this.displayNone = true;
    this.layerSelectionForm = false;
  }

  removeUploadContainer() {
    this.showUpload = false;
    this.displayNone = false;
    this.layerSelectionForm = false;
  }

  toggleLegendView(legendToggled, index) {
    this.visualizationLegends.forEach((legend, legendIndex) => {
      index === legendIndex ? legend.opened = !legend.opened : legend.opened = false;
    })
  }

  toggleRemoveButton() {
    this.isRemovable = !this.isRemovable;
  }

  removeLegendContainer() {
    this.closeLegend.emit(null);
  }

  toggleTileLegendView() {
    this.openTileLegend = !this.openTileLegend;
  }

  showButtonIcons() {
    this.showButtonIncons = true;
  }

  hideButtonIcons() {
    this.showButtonIncons = false;
  }

  stickLegendContainer() {
    if (!this.sticky) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }
    this.stickyLegend.emit(this.sticky)
  }

  toggleBoundaryLayer() {
    this.toggleBoundary = !this.toggleBoundary;
  }

  toggleLayerView(layer, layerType,event) {
    event.stopPropagation();

    const legend = _.find(this.boundaryLegend, ['id', layer.id]);
    const other = _.find(this.visualizationLegends, ['id', layer.id]);
    const toggleLayer = legend ? legend : other;
    const hidden = toggleLayer.hidden = !toggleLayer.hidden;
    if (hidden) {
      this.updateMapLayer(layer, 'HIDE');
    } else {
      this.updateMapLayer(layer, 'SHOW');
    }
  }

  closeDownloads() {
    this.showDownload = false;
    this.displayNone = true;
  }

  downloadMap(format) {
    this.downloadMapAsFiles.emit({format: format, data: this.mapVsualizationObject});
  }

  updateOpacity(event) {

  }

  shortenTitle(longTitle) {

    if (longTitle) {
      if (longTitle.length > 25) {
        return longTitle.substr(0, 25) + '..';
      } else if (longTitle.length === 0) {
        return 'Layer Legend';
      } else if (longTitle.length <= 25) {
        return longTitle;
      }
    } else {
      longTitle = '';
    }
    return longTitle;
  }

  showDataTableAction() {
    this.showDataTable.emit({visualizationObject: this.mapVsualizationObject, legend: this.visualizationLegends});
  }

  addLayer() {
    this.layerSelectionForm = true;
  }

  createLayer(event) {
    this.layerSelectionForm = true;
    this.layerSelectionForm = false;
    this.newLayerEvent.emit({visualization: this.mapVsualizationObject, event: event});
  }

  uploadFile(event: EventTarget) {
    let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    let files: FileList = target.files;
    let file = files[0];
    const fileName = file.name;
    if (fileName.indexOf('.json') >= 0 || fileName.indexOf('.geojson') >= 0) {
      if (file) {
        const r = new FileReader();
        r.onload = (e: any) => {
          let contentFromUploadedFile: any;
          contentFromUploadedFile = (new Function("return " + e.target.result))();
          this.uploadEvent(contentFromUploadedFile);
        }
        r.readAsText(file);
      } else {

      }
    } else {
      console.log("Not a geojson file");
    }


  }

  uploadEvent(eventInformation) {
    this.fileUploadEvent.emit(eventInformation);
  }

}
