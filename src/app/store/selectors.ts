import {ApplicationState} from './application.state';
import {createSelector} from '@ngrx/store';

import * as _ from 'lodash';

/**
 * Created by kelvin on 9/9/17.
 */
export const getStoreData = (state: ApplicationState) => state.storeData;

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


