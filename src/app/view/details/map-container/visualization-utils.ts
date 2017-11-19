import * as _ from 'lodash';
function loadInitialVisualizationObject(cardData: any): any {
  return {
    id: cardData.hasOwnProperty('id') ? cardData.id : null,
    name: _getVisualizationObjectName(cardData),
    type: cardData.hasOwnProperty('type') ? cardData.type : null,
    created: cardData.hasOwnProperty('created') ? cardData.created : null,
    lastUpdated: cardData.hasOwnProperty('lastUpdated') ? cardData.lastUpdated : null,
    shape: cardData.hasOwnProperty('shape') ? cardData.shape : 'NORMAL',
    dashboardId: 'score_card_map',
    subtitle: null,
    description: null,
    details: {
      shape: cardData.hasOwnProperty('shape') ? cardData.shape : 'NORMAL',
      loaded: false,
      hasError: false,
      errorMessage: '',
      appKey: cardData.hasOwnProperty('appKey') ? cardData.appKey : null,
      hideCardBorders: false,
      showCardHeader: true,
      showCardFooter: true,
      showChartOptions: true,
      showFilter: true,
      cardHeight: '400px',
      itemHeight: '390px',
      fullScreen: false,
      type: _getSanitizedCurrentVisualizationType(cardData.hasOwnProperty('type') ? cardData.type : null),
      currentVisualization: _getSanitizedCurrentVisualizationType(cardData.hasOwnProperty('type') ? cardData.type : null),
      favorite: {},
      externalDimensions: {},
      filters: [],
      layouts: [],
      analyticsStrategy: 'normal',
      rowMergingStrategy: 'normal',
      userOrganisationUnit: [],
      description: null,
      isNew: false
    },
    layers: [],
    operatingLayers: []
  };
}

function _getVisualizationObjectName(cardData) {
  return cardData.type !== null && cardData.hasOwnProperty(_.camelCase(cardData.type)) ? _.isPlainObject(cardData[_.camelCase(cardData.type)]) ? cardData[_.camelCase(cardData.type)].displayName : null : null;
}

function _getSanitizedCurrentVisualizationType(visualizationType: string): string {
  let sanitizedVisualization: string = null;

  if (visualizationType === 'CHART' || visualizationType === 'EVENT_CHART') {
    sanitizedVisualization = 'CHART';
  } else if (visualizationType === 'TABLE' || visualizationType === 'EVENT_REPORT' || visualizationType === 'REPORT_TABLE') {
    sanitizedVisualization = 'TABLE';
  } else if (visualizationType === 'MAP') {
    sanitizedVisualization = 'MAP';
  } else {
    sanitizedVisualization = visualizationType;
  }
  return sanitizedVisualization;
}


export { loadInitialVisualizationObject };
