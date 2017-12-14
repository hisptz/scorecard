import { ScoreCard } from '../../shared/models/scorecard';
import { createSelector } from '@ngrx/store';
import {getRouterState, getScorecardState} from '../reducers';
import * as fromCreate from '../reducers/create.reducer';
import { getCreateadState } from '../reducers';

import * as _ from 'lodash';

export const getScorecardToCreate = createSelector(getCreateadState, fromCreate.getCreatedScorecard);

export const getNeedForGroup = createSelector(getCreateadState, fromCreate.getNeedForGroup);
export const getNeedForIndicator = createSelector(getCreateadState, fromCreate.getNeedForIndicator);
export const getCurrentIndicatorHolder = createSelector(getCreateadState, fromCreate.getCurrentIndicatorHolder);
export const getCurrentGroup = createSelector(getCreateadState, fromCreate.getCurrentGroup);
export const getNextGroupId = createSelector(getCreateadState, fromCreate.getNextGroupId);
export const getNextHolderId = createSelector(getCreateadState, fromCreate.getNextHolderId);
export const getHoldersList  = createSelector(
  getScorecardToCreate,
  (scorecard: ScoreCard) => {
    const indicators_list = [];
    for (const data of scorecard.data.data_settings.indicator_holder_groups ) {
      for ( const holders_list of data.indicator_holder_ids ) {
        for ( const holder of scorecard.data.data_settings.indicator_holders ) {
          if (holder.holder_id === holders_list) {
            indicators_list.push(holder);
          }
        }
      }
    }
    return indicators_list;
  }
  );
