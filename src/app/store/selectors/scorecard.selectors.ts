import { createSelector } from '@ngrx/store';
import * as fromScorecard from '../reducers/scorecard.reducer';
import {getRouterState, getScorecardState} from '../reducers';
import {ScoreCard} from '../../shared/models/scorecard';

export const getScorecardEntites = createSelector(getScorecardState, fromScorecard.getScorecardEntities);
export const getScorecardLoaded = createSelector(getScorecardState, fromScorecard.getScorecardLoaded);
export const getScorecardLoading = createSelector(getScorecardState, fromScorecard.getScorecardLoading);

export const getSelectedScorecard = createSelector(
  getScorecardEntites,
  getRouterState,
  (entities, router): ScoreCard => {
    return router.state && entities[router.state.params.scorecardId];
  }
);

// return all scorecards as an array instead of objects
export const getAllScorecards = createSelector(getScorecardEntites, entities => {
  return Object.keys(entities).map(id => entities[id]);
})
