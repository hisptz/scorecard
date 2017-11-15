import {ApplicationState} from './application.state';
import {createSelector} from '@ngrx/store';

import * as _ from 'lodash';

/**
 * Created by kelvin on 9/9/17.
 */
export const getStoreData = (state: ApplicationState) => state.storeData;

export const getIndicatorPreviewData = (state: ApplicationState) => state.indicatorPreview;

export const getScorecards = createSelector(getStoreData, (datastate) => {
  return datastate.scorecards;
});

export const getSelectedScorecard = createSelector(getStoreData, (datastate) => {
  return datastate.selectedScorecard;
});

export const getLoadingPercent = createSelector(getStoreData, (datastate) => {
  return datastate.loadingPercent;
});

export const getLoadingState = createSelector(getStoreData, (datastate) => {
  return datastate.loadingScorecards;
});

export const getSelectedPeriod = createSelector(getStoreData, (datastate) => {
  return datastate.selectedPeriod;
});

export const getSelectedOrgunit = createSelector(getStoreData, (datastate) => {
  return datastate.selectedOrgunit;
});

export const getFunctions = createSelector(getStoreData, (datastate) => {
  return datastate.functions;
});

// Indicator preview selectors
export const getPreviewOuModel = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.ouModel;
});

export const getPreviewSelectedPeriod = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.selectedPe;
});

export const getPreviewSelectedOu = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.selectedOu;
});

export const getPreviewPeriodType = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.periodType;
});

export const getPreviewYear = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.year;
});

export const getPreviewAnalytics = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.analytics;
});

export const getPreviewChart = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.chartObject;
});

export const getPreviewMap = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.mapObject;
});

export const getPreviewTable = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.tableObject;
});

export const getPreviewLoading = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.loading;
});

export const getShowModel = createSelector(getIndicatorPreviewData, ( previewData ) => {
  return previewData.showModel;
});



