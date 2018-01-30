import { createSelector } from '@ngrx/store';
import * as fromScorecard from '../reducers/scorecard.reducer';
import {getRouterState, getScorecardState} from '../reducers';
import {ScoreCard} from '../../shared/models/scorecard';

export const getAllScorecards = createSelector(getScorecardState, fromScorecard.selectAllScorecard);
export const getScorecardEntites = createSelector(getScorecardState, fromScorecard.selectScorecardEntities);
export const getScorecardLoaded = createSelector(getScorecardState, fromScorecard.getScorecardLoaded);
export const getScorecardLoading = createSelector(getScorecardState, fromScorecard.getScorecardLoading);

export const getSelectedScorecard = createSelector(
  getScorecardEntites,
  getRouterState,
  (entities, router): ScoreCard => {
    return router.state && entities[router.state.params.scorecardId];
  }
);
