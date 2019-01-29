import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';
import 'rxjs/add/observable/of';
import {ColorInterpolationService} from './color-interpolation.service';
import {MapLayerEvent} from '../model/layer-event';
import {LegendSet} from '../model/legend-set';
import {OrgUnitService} from './org-unit.service';
import {HttpClientService} from './http-client.service';

@Injectable()
export class LegendSetService {

  constructor(private http: HttpClientService,
              private orgUnitService: OrgUnitService,
              private colorInterpolation: ColorInterpolationService) {
  }

  getLegendSet(visualizationDetails: any) {
    const apiRootUrl = visualizationDetails.apiRootUrl;
    const visualizationLayers = visualizationDetails.visualizationObject.layers;
    const legendSetArray = visualizationLayers.map(layer => {
      return layer.settings.legendSet;
    });
    return Observable.create(observer => {
      Observable.forkJoin(
        legendSetArray.map(legendSet => {
          return legendSet ? this.http.get(this._getLegendSetUrl(apiRootUrl, legendSet.id)) : Observable.of(null);
        })
      ).subscribe(legendSets => {
        visualizationDetails.legendSets = legendSets;
        observer.next(visualizationDetails);
        observer.complete();
      }, error => observer.error(error));
    });
  }

  private _getLegendSetUrl(apiRootUrl, legendSetId) {
    return apiRootUrl + 'legendSets/' + legendSetId + '.json?fields=id,name,legends[id,name,startValue,endValue,color]';
  }

  public prepareTileLayers(tileLayers) {
    const baseMapLayers: any = [];

    const layerNames = Object.getOwnPropertyNames(tileLayers);

    layerNames.forEach(layer => {
      const tileLayer: any = {
        name: tileLayers[layer].name,
        label: tileLayers[layer].label,
        active: tileLayers[layer].active,
        aliasName: tileLayers[layer].aliasName,
        url: tileLayers[layer].url,
        image: tileLayers[layer].image,
        maxZoom: tileLayers[layer].maxZoom
      };
      baseMapLayers.push(tileLayer);
    });

    return baseMapLayers;
  }

  public prepareEventLayerLegendClasses(visualizationLayerSettings, visualizationAnalytics) {
    const legend: any[] = [];
    const eventPointColor = this._strimMoreHashFromColor(visualizationLayerSettings.eventPointColor);
    const eventPointRadius = visualizationLayerSettings.eventPointRadius;


    legend.push({
      name: this.getEventName(visualizationAnalytics)[1],
      label: this.getEventName(visualizationAnalytics)[1],
      description: '',
      relativeFrequency: '',
      min: 0,
      max: 0,
      color: eventPointColor,
      count: visualizationAnalytics.height,
      radius: eventPointRadius,
      boundary: false
    });
    return legend;
  }

  public boundaryLayerLegendClasses(mapVisualizationSettings, mapVisualizationAnalytics?): Observable<any> {
    const features = mapVisualizationSettings.geoFeature;
    const Levels = this._getBoundaryLevels(features);
    const totalFeatures = features.length;
    const boundaryLevels = [];
    const legend: any[] = [];


    return Observable.create((observable) => {
      this.orgUnitService.getOrgunitLevelsInformation().subscribe((organisationUnitLevelsData: any) => {
        organisationUnitLevelsData.organisationUnitLevels.forEach((organisationUnitLevel) => {
          const indexLevel = _.findIndex(Levels, ['id', organisationUnitLevel.level]);
          if (_.find(Levels, ['id', organisationUnitLevel.level])) {
            Levels[indexLevel].name = organisationUnitLevel.name;
          }
        });

        Levels.forEach(level => {
          legend.push({
            name: level.name,
            label: level.name,
            description: '',
            relativeFrequency: '',
            min: 0,
            max: 0,
            percentage: ((level.count / totalFeatures) * 100).toFixed(0) + '%',
            color: this._getLevelColor(Levels, level),
            count: level.count,
            radius: '',
            boundary: true
          });
        });
        observable.next(legend);
        observable.complete();
      });
    });
  }

  public boundaryLayerClasses(mapVisualizationSettings) {
    const features = mapVisualizationSettings.geoFeature;
    const Levels = this._getBoundaryLevels(features);
    const legend: any[] = [];

    Levels.forEach(level => {
      legend.push({
        name: level.id,
        label: level.id,
        description: '',
        relativeFrequency: '',
        min: 0,
        max: 0,
        color: this._getLevelColor(Levels, level),
        count: level.count,
        radius: '',
        boundary: true
      });
    });
    return legend;

  }

  public prepareThematicLayerLegendClasses(visualizationLayerSettings, visualizationAnalytics) {
    const legendSettings = visualizationLayerSettings;
    const dataArray = [];

    let legendsFromLegendSet = null;

    let obtainedDataLegend = null;

    if (!legendSettings.colorScale && !legendSettings.legendSet) {
      legendSettings['colorScale'] = this.colorInterpolation.getColorScaleFromHigLow(visualizationLayerSettings);
    }

    if (!legendSettings.colorScale && legendSettings.legendSet) {
      legendsFromLegendSet = this.getColorScaleFromLegendSet(legendSettings.legendSet);
      legendSettings['colorScale'] = legendsFromLegendSet.colorScale;
    }


    if (legendSettings.colorScale && legendSettings.legendSet) {
      legendsFromLegendSet = this.getColorScaleFromLegendSet(legendSettings.legendSet);
      legendSettings['colorScale'] = legendsFromLegendSet.colorScale;
    }

    if (visualizationAnalytics && visualizationAnalytics.hasOwnProperty('headers')) {
      visualizationAnalytics.rows.forEach((row) => {
        dataArray.push(+row[_.findIndex(visualizationAnalytics.headers, {'name': 'value'})]);
      })
      const sortedData = _(dataArray).sortBy().value();

      if (legendSettings.method === 1) {
        obtainedDataLegend = this.prepareLegendSet(visualizationLayerSettings, legendsFromLegendSet, visualizationAnalytics);
      }

      if (legendSettings.method === 2) {
        if (legendSettings.legendSet) {
          obtainedDataLegend = this.prepareLegendSet(visualizationLayerSettings, legendsFromLegendSet, visualizationAnalytics);
        } else {
          obtainedDataLegend = this.generateLegendClassLimits(visualizationLayerSettings, visualizationAnalytics);
        }

      }

      if (legendSettings.method === 3) {

        if (legendSettings.legendSet) {
          obtainedDataLegend = this.prepareLegendSet(visualizationLayerSettings, legendsFromLegendSet, visualizationAnalytics);
        } else {
          obtainedDataLegend = this.generateLegendClassLimits(visualizationLayerSettings, visualizationAnalytics);
        }
      }

    }
    return obtainedDataLegend;
  }

  public getEventName(visualizationAnalytics) {
    const metaDataObject = visualizationAnalytics.metaData;
    const ou = metaDataObject.ou;
    const names = metaDataObject.names;

    // TODO : Find a best way to remove this hardcoding
    let eventName = '';
    let eventid = '';
    for (const propt in names) {
      if (ou.indexOf(propt) < 0 && propt !== 'ou') {
        eventName = names[propt];
        eventid = propt;
      }

    }

    return [eventName, metaDataObject[eventid]];
  }

  public prepareLayerEvent(layer, action): MapLayerEvent {
    const event: MapLayerEvent = {
      action: action,
      layer: layer
    }

    return event;
  }

  public refineLegendSettings(settings) {
    const legendSettings = {
      radiusHigh: 15,
      eventClustering: false,
      colorLow: '#ff0000',
      opacity: 0.8,
      colorHigh: '#00ff00',
      eventPointRadius: 0,
      classes: 5,
      method: 2,
      radiusLow: 5
    }

    const properties = _.keys(legendSettings);
    properties.forEach(property => {
      !settings.hasOwnProperty(property) ? settings[property] = legendSettings[property] : settings[property] = settings[property];
    })
    return settings;
  }

  private _getLevelColor(Levels, level) {
    const colorByIndex = ['#000000', '#0101DF', '#2F2FFD', '#FF0000', '#008000'];
    if (Levels.length === 1) {
      return '#000000';
    } else {
      return colorByIndex[Levels.indexOf(level)];
    }
  }

  generateLegendClassLimits(visualizationLayerSettings, visualizationAnalytics) {
    let legendSetColorArray: any = null;
    if (visualizationLayerSettings.colorScale) {
      legendSetColorArray = Array.isArray(visualizationLayerSettings.colorScale) ? visualizationLayerSettings.colorScale :
        visualizationLayerSettings.colorScale.split(',');
    } else {
      legendSetColorArray = this.colorInterpolation.getColorScaleFromHigLow(visualizationLayerSettings);
    }


    let dataArray: any[] = [], legend: any = [];
    const classLimits = [], classRanges = [];
    let doneWorkAround = false;

    if (visualizationAnalytics && visualizationAnalytics.hasOwnProperty('headers')) {
      const sortedData = this._getDataSortedArray(visualizationAnalytics);
      dataArray = sortedData;

      const interval = +((visualizationLayerSettings.radiusHigh - visualizationLayerSettings.radiusLow) / visualizationLayerSettings.classes).toFixed(0);
      const radiusArray = [];
      for (let classNumber = 0; classNumber < visualizationLayerSettings.classes; classNumber++) {
        if (classNumber === 0) {
          radiusArray.push(visualizationLayerSettings.radiusLow);
        } else {
          radiusArray.push(radiusArray[classNumber - 1] + interval);
        }
      }

      // Workaround for classess more than values
      if (sortedData.length < visualizationLayerSettings.classes) {
        if (sortedData.length === 0 && doneWorkAround === false) {
          sortedData.push(0);
          doneWorkAround = true;
        }
        if (sortedData.length === 1 && doneWorkAround === false) {
          sortedData.push(sortedData[0] + 1);
          doneWorkAround = true;
        }
      }

      for (let classIncr = 0; classIncr <= visualizationLayerSettings.classes; classIncr++) {
        if (visualizationLayerSettings.method === 3) { // equal counts
          const index = classIncr / visualizationLayerSettings.classes * (sortedData.length - 1);
          if (Math.floor(index) === index) {
            classLimits.push(sortedData[index]);
          } else {
            const approxIndex = Math.floor(index);
            classLimits.push(sortedData[approxIndex] + (sortedData[approxIndex + 1] - sortedData[approxIndex]) * (index - approxIndex));
          }
        } else {
          classLimits.push(Math.min.apply(Math, sortedData) + ( (Math.max.apply(Math, sortedData) - Math.min.apply(Math, sortedData)) / visualizationLayerSettings.classes ) * classIncr);
        }
      }


      if (doneWorkAround) {
        dataArray.pop()
      }
      // Offset Workaround
      // Populate data count into classes
      classLimits.forEach(function (classLimit, classIndex) {
        if (classIndex < classLimits.length - 1) {
          const min = classLimits[classIndex], max = classLimits[classIndex + 1];
          legend.push({
            name: '',
            label: '',
            description: '',
            relativeFrequency: '',
            min: +min.toFixed(1),
            max: +max.toFixed(1),
            color: legendSetColorArray[classIndex],
            count: 0,
            radius: 0,
            boundary: false
          });
        }
      });

    }
    legend = this.getLegendCounts(dataArray, legend);
    return legend;
  }

  getMapRadiusLegend(settings, analytics) {
    const radiusHigh = settings.radiusHigh;
    const radiusLow = settings.radiusLow;
    const classess = settings.classes;
    const method = settings.method;
    const legend = [];
    const dataArray = this._getDataSortedArray(analytics);

    const interval = +((radiusHigh - radiusLow) / classess).toFixed(0);
    const radiusArray = [];
    for (let classNumber = 0; classNumber < classess; classNumber++) {
      if (classNumber === 0) {
        radiusArray.push(radiusLow);
      } else if (classNumber === classess - 1) {
        radiusArray.push(radiusHigh);
      } else {
        radiusArray.push(radiusArray[classNumber - 1] + interval);
      }

    }

    const classLimits = [];
    let doneWorkAround = false;

    // Workaround for classess more than values
    if (dataArray.length < classess) {
      if (dataArray.length === 0 && doneWorkAround === false) {
        dataArray.push(0);
        doneWorkAround = true;
      }
      if (dataArray.length === 1 && doneWorkAround === false) {
        dataArray.push(dataArray[0] + 1);
        doneWorkAround = true;
      }
    }

    for (let classIncr = 0; classIncr <= classess; classIncr++) {
      if (method === 3) {
        const index = classIncr / classess * (dataArray.length - 1);
        if (Math.floor(index) === index) {
          classLimits.push(dataArray[index]);
        } else {
          const approxIndex = Math.floor(index)
          classLimits.push(dataArray[approxIndex] + (dataArray[approxIndex + 1] - dataArray[approxIndex]) * (index - approxIndex));
        }
      } else {
        classLimits.push(Math.min.apply(Math, dataArray) + ( (Math.max.apply(Math, dataArray) - Math.min.apply(Math, dataArray)) / classess ) * classIncr);
      }
    }

    if (doneWorkAround) {
      dataArray.pop();
    } // Offset Workaround
    // Populate data count into classess
    classLimits.forEach(function (classLimit, classIndex) {
      if (classIndex < classLimits.length - 1) {
        const min = classLimits[classIndex], max = classLimits[classIndex + 1];
        legend.push({min: +(min.toFixed(1)), max: +(max.toFixed(1)), radius: radiusArray[classIndex]});
      }
    });

    return legend;

  }

  getFeatureRadius(legend, dataValue) {
    let theRadius = 0;
    const value = +(dataValue);
    legend.forEach(function (classRadiusLimit, classRadiusIndex) {
      if (classRadiusLimit.min <= value && value < classRadiusLimit.max) {
        theRadius = classRadiusLimit.radius;
      }

      if (classRadiusIndex === legend.length - 1 && classRadiusLimit.min < value && value === classRadiusLimit.max) {
        theRadius = classRadiusLimit.radius;
      }
    });
    return theRadius;
  }

  prepareLegendSet(visualizationLayerSettings, legendsFromLegendSet, visualizationAnalytics) {
    let legend: any[] = [];
    let dataArray: any[] = [];
    const interval = +((visualizationLayerSettings.radiusHigh - visualizationLayerSettings.radiusLow) / legendsFromLegendSet.sets.length).toFixed(0);
    const radiusArray = [];
    for (let classNumber = 0; classNumber < legendsFromLegendSet.sets.length; classNumber++) {
      if (classNumber === 0) {
        radiusArray.push(visualizationLayerSettings.radiusLow);
      } else {
        radiusArray.push(radiusArray[classNumber - 1] + interval);
      }
    }

    dataArray = this._getDataSortedArray(visualizationAnalytics);
    legendsFromLegendSet.sets.forEach((set, setIndex) => {
      legend.push({
        name: set.name,
        label: set.name,
        description: '',
        percentage: 0,
        min: set.min,
        max: set.max,
        count: 0,
        color: set.color,
        radius: radiusArray[setIndex],
        boundary: false
      });
    });
    legend = this.getLegendCounts(dataArray, legend);
    return legend;
  }

  getColorScaleFromLegendSet(legendSet) {
    const legends = legendSet.legends;
    const sortedLegends = [];

    const legendsValue = [];
    const sortedLegendsValue = [];


    legends.forEach((legend, legendIndex) => {
      legendsValue.push(legend.startValue);
      sortedLegendsValue.push(legend.startValue);
    });

    sortedLegendsValue.sort((n1, n2) => n1 - n2);
    let colorScale = '';
    sortedLegendsValue.forEach((sortedLegendVale, legendValueIndex) => {
      let extraction = legends[legendsValue.indexOf(sortedLegendVale)];
      extraction = JSON.stringify(extraction);
      extraction = extraction.replace('startValue', 'min');
      extraction = extraction.replace('endValue', 'max');
      extraction = (new Function('return' + extraction))();
      sortedLegends.push(extraction);
      colorScale += extraction.color + ','
    });
    return {colorScale: colorScale, sets: sortedLegends}

  }

  getLegendCounts(dataArray, legend) {
    let totalCounts = 0;
    dataArray.forEach(data => {
      legend.forEach((legendItem, legendIndex) => {
        if (legendItem.min <= data && data < legendItem.max) {
          legendItem.count += 1;
          totalCounts += 1;
        }

        if (legendIndex === legend.length - 1 && legendItem.min < data && data === legendItem.max) {
          legendItem.count += 1;
          totalCounts += 1;
        }
      });
    });

    legend.forEach(leg => {
      const fraction = (leg.count / totalCounts);
      leg.percentage = fraction ? (fraction * 100).toFixed(0) + '%' : '';
    })

    return legend;
  }

  getFacilityLayerLegendClasses(visualizationLayerSettings, isLegendView) {
    const legend: LegendSet = {
      id: '',
      name: '',
      description: '',
      hidden: false,
      opened: false,
      pinned: false,
      isEvent: false,
      isClustered: false,
      isThematic: false,
      isBoundary: false,
      isFacility: true,
      useIcons: false,
      opacity: 0,
      classes: [],
      change: []
    }


    const groupSet = visualizationLayerSettings.organisationUnitGroupSet;
    const features = visualizationLayerSettings.geoFeature;
    legend.id = visualizationLayerSettings.id;
    legend.name = groupSet.name;
    legend.opacity = visualizationLayerSettings.opacity ? visualizationLayerSettings.opacity * 100 : 80;
    const totalFeatures: number = features.length;
    groupSet.organisationUnitGroups.forEach(group => {
      const classLegend = {
        name: group.name,
        label: '',
        id: group.id,
        description: '',
        relativeFrequency: '',
        min: 0,
        max: 0,
        level: 0,
        color: '',
        collapse: '',
        icon: group.symbol,
        radius: 0,
        count: group.organisationUnits.length,
        boundary: false,
      }

      classLegend.relativeFrequency = totalFeatures !== 0 ? (classLegend.count / totalFeatures).toFixed(0) + '%' : '';
      legend.classes.push(classLegend);
      if (!isLegendView) {
        features.forEach(feature => {
          const featureIndex = _.findIndex(group.organisationUnits, ['id', feature.id]);
          if (featureIndex > -1) {
            feature.dimensions.icon = group.symbol
          }

        })
      }


    })
    visualizationLayerSettings.geoFeature = features;
    return [legend.classes, visualizationLayerSettings];
  }

  private _strimMoreHashFromColor(color) {
    const colorArray = color.split('#');
    return '#' + colorArray[colorArray.length - 1];
  }

  private _getBoundaryLevels(features) {
    const levels: any[] = [];
    features.forEach(feature => {
      if (_.find(levels, ['id', feature.le])) {

        _.find(levels, ['id', feature.le]).count += 1;
      } else {
        levels.push({id: feature.le, name: null, count: 1})
      }
    })
    return levels;
  }

  private _getDataSortedArray(visualizationAnalytics) {
    const dataArray = [];
    let sortedData = [];
    if (visualizationAnalytics && visualizationAnalytics.hasOwnProperty('headers')) {
      visualizationAnalytics.rows.forEach((row) => {
        dataArray.push(+row[_.findIndex(visualizationAnalytics.headers, {'name': 'value'})]);
      })
      sortedData = _(dataArray).sortBy().value();
    }
    return sortedData;
  }
}
