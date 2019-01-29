import {
  createScorecardFromStore,
  getScorecardOptions
} from './createScorecardFromMetadataHelper';
import { getOrgunitState, getViewedState } from '../reducers';
import { createSelector } from '@ngrx/store';
import { ScoreCard, ScorecardData } from '../../shared/models/scorecard';
import { ViewScorecardState } from '../reducers/view.reducer';
import { getFunctionsLoaded } from '../reducers/static-data.reducer';
import { getOrgunitLoaded } from '../reducers/orgunits.reducer';

export const getScorecardToView = createSelector(
  getViewedState,
  createScorecardFromStore
);
export const getSelectedOu = createSelector(
  getViewedState,
  (data: ViewScorecardState) => data.orgunit
);
export const getSelectedPe = createSelector(
  getViewedState,
  (data: ViewScorecardState) => data.period
);
export const getLoaded = createSelector(
  getViewedState,
  (data: ViewScorecardState) => data.loaded
);
export const getSortingColumnId = createSelector(
  getViewedState,
  (data: ViewScorecardState) => data.sortingColumn
);

// Base selectors
export const getDataSection = createSelector(
  getScorecardToView,
  (scorecard: ScoreCard) => scorecard.data
);

export const getScorecardId = createSelector(
  getScorecardToView,
  (data: ScoreCard) => data.id
);

export const getCanEdit = createSelector(
  getScorecardToView,
  (data: ScoreCard) => data.can_edit
);

export const getOrgUnitSettings = createSelector(
  getDataSection,
  (data: ScorecardData) => data.orgunit_settings
);

export const getOptions = createSelector(
  getDataSection,
  getScorecardOptions
);

export const getPeriodType = createSelector(
  getDataSection,
  (data: ScorecardData) => data.periodType
);

export const getSelectedPeriod = createSelector(
  getDataSection,
  (data: ScorecardData) => data.selected_periods
);

export const getHeader = createSelector(
  getDataSection,
  (data: ScorecardData) => data.header
);

export const getHeaderTemplete = createSelector(
  getHeader,
  data => data.template
);

export const getLegendSetDefinition = createSelector(
  getDataSection,
  (data: ScorecardData) => data.legendset_definitions
);

export const getHighlightedIndicators = createSelector(
  getDataSection,
  (data: ScorecardData) => data.highlighted_indicators
);

export const getDataSettings = createSelector(
  getDataSection,
  (data: ScorecardData) => data.data_settings
);

export const getIndicatorHolders = createSelector(
  getDataSettings,
  data => data.indicator_holders
);

export const getHolderGroups = createSelector(
  getDataSettings,
  data => data.indicator_holder_groups
);

export const getAdditionalLabels = createSelector(
  getDataSection,
  (data: ScorecardData) => data.additional_labels
);

export const getFooter = createSelector(
  getDataSection,
  (data: ScorecardData) => data.footer
);

export const getUser = createSelector(
  getDataSection,
  (data: ScorecardData) => data.user
);

export const getUserGroups = createSelector(
  getDataSection,
  (data: ScorecardData) => data.user_groups
);

export const getShowScore = createSelector(
  getDataSection,
  (data: ScorecardData) => data.show_score
);

export const metaDataReady = createSelector(
  getViewedState,
  data => {
    if (data.orgunit === null || data.period === null) {
      return false;
    } else {
      return true;
    }
  }
);

export const getHoldersList = createSelector(
  getHolderGroups,
  getIndicatorHolders,
  (holderGroups, indicatorHolders) => {
    const indicators_list = [];
    for (const data of holderGroups) {
      for (const holders_list of data.indicator_holder_ids) {
        for (const holder of indicatorHolders) {
          if (holder.holder_id === holders_list) {
            indicators_list.push(holder);
          }
        }
      }
    }
    return indicators_list;
  }
);

export const getSortingColumn = createSelector(
  getHoldersList,
  getSortingColumnId,
  (holderList, sortingColumId) => {
    let sortingColumn = 'Organisation Unit';
    for (const holder of holderList) {
      for (const indicator of holder.indicators) {
        if (indicator.id === sortingColumId) {
          sortingColumn = indicator.title;
        }
      }
    }
    return sortingColumn;
  }
);
