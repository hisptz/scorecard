import {ScoreCard, ScorecardData} from '../../shared/models/scorecard';
import { createSelector } from '@ngrx/store';
import {getRouterState, getScorecardState} from '../reducers';
import * as fromCreate from '../reducers/create.reducer';
import { getCreateadState } from '../reducers';

import * as _ from 'lodash';
import {createScorecardFromStore, getScorecardOptions} from './createScorecardFromMetadataHelper';

export const getScorecardToCreate = createSelector(getCreateadState, createScorecardFromStore);

export const getNeedForGroup = createSelector(getCreateadState, fromCreate.getNeedForGroup);
export const getNeedForIndicator = createSelector(getCreateadState, fromCreate.getNeedForIndicator);
export const getCurrentIndicatorHolder = createSelector(getCreateadState, fromCreate.getCurrentIndicatorHolder);
export const getCurrentGroup = createSelector(getCreateadState, fromCreate.getCurrentGroup);
export const getNextGroupId = createSelector(getCreateadState, fromCreate.getNextGroupId);
export const getNextHolderId = createSelector(getCreateadState, fromCreate.getNextHolderId);
export const getShowTitleEditor = createSelector(getCreateadState, fromCreate.getShowTitleEditor);
export const getActionType = createSelector(getCreateadState, fromCreate.getActionType);

export const getTitleWarning = createSelector(
  getScorecardToCreate,
  (scorecard: ScoreCard) => {
    return scorecard.data.data_settings.indicator_holders.length === 0
      || scorecard.data.header.title === ''
      || scorecard.data.header.description === '';
  });


// Base selectors
export const getDataSection = createSelector(getScorecardToCreate, (scorecard: ScoreCard) => scorecard.data);

export const getCanEdit = createSelector(getScorecardToCreate, (scorecard: ScoreCard) => scorecard.can_edit);

export const getOrgUnitSettings = createSelector(getDataSection, (data: ScorecardData) => data.orgunit_settings);

export const getOptions = createSelector(getDataSection, getScorecardOptions );

export const getPeriodType = createSelector(getDataSection, (data: ScorecardData) => data.periodType);

export const getSelectedPeriod = createSelector(getDataSection, (data: ScorecardData) => data.selected_periods);

export const getHeader = createSelector(getDataSection, (data: ScorecardData) => data.header);

export const getName = createSelector(getHeader, (data) => data.title);

export const getHeaderTemplete = createSelector(getHeader, (data) => data.template);

export const getLegendSetDefinition = createSelector(getDataSection, (data: ScorecardData) => data.legendset_definitions);

export const getHighlightedIndicators = createSelector(getDataSection, (data: ScorecardData) => data.highlighted_indicators);

export const getDataSettings = createSelector(getDataSection, (data: ScorecardData) => data.data_settings);

export const getIndicatorHolders = createSelector(getDataSettings, (data) => data.indicator_holders);

export const getHolderGroups = createSelector(getDataSettings, (data) => data.indicator_holder_groups);

export const getAdditionalLabels = createSelector(getDataSection, (data: ScorecardData) => data.additional_labels);

export const getFooter = createSelector(getDataSection, (data: ScorecardData) => data.footer);

export const getUser = createSelector(getDataSection, (data: ScorecardData) => data.user);

export const getUserGroups = createSelector(getDataSection, (data: ScorecardData) => data.user_groups);

export const getShowScore = createSelector(getDataSection, (data: ScorecardData) => data.show_score);

export const getHoldersList  = createSelector(
  getHolderGroups,
  getIndicatorHolders,
  (holderGroups, indicatorHolders) => {
    const indicators_list = [];
    for (const data of holderGroups ) {
      for ( const holders_list of data.indicator_holder_ids ) {
        for ( const holder of indicatorHolders ) {
          if (holder.holder_id === holders_list) {
            indicators_list.push(holder);
          }
        }
      }
    }
    return indicators_list;
  });



