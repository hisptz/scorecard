import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import {ScoreCard} from '../../shared/models/scorecard';
import * as scorecardActions from '../actions/scorecard.actions';

export interface ScorecardState extends EntityState<ScoreCard> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: ScoreCard, b: ScoreCard): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<ScoreCard> = createEntityAdapter<ScoreCard>({
  sortComparer: sortByName,
});

export const initialState: ScorecardState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function scorecardReducer(
  state = initialState,
  action: scorecardActions.Actions
): ScorecardState {
  switch (action.type) {
    // initiate loading state when scorecard are first loaded (actual loading will be done in effects)
    case (scorecardActions.LOAD_SCORECARDS): {
      return {
        ...state,
        loading: true
      };
    }

    // initiate loading state when scorecard are first loaded (actual loading will be done in effects)
    case (scorecardActions.LOAD_SCORECARDS_COMPLETE): {
      return {
        ...state,
        loading: false,
        loaded: true
      };
    }

    // initiate loading state when scorecard are first loaded (actual loading will be done in effects)
    case (scorecardActions.LOAD_SCORECARDS_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }

    // this will be called once a single scorecard has been called successful
    case (scorecardActions.LOAD_SCORECARD_SUCCESS): {
      return adapter.addOne(action.payload, state);
    }

    // this will be called once a single scorecard has been called successful
    case (scorecardActions.UPDATE_SCORECARD_SUCCESS): {
      return adapter.updateOne(action.payload, state);
    }

    // this will be called once a scorecard has been removed successful
    case scorecardActions.REMOVE_SCORECARD_SUCCESS: {
      return adapter.removeOne(action.payload, state);
    }
  }

  return state;
}

// scorecard high level selectors from its state
export const getScorecardLoading = (state: ScorecardState) => state.loading;
export const getScorecardLoaded = (state: ScorecardState) => state.loaded;
export const {
  // select the array of user ids
  selectIds: selectScorecardIds,

  // select the dictionary of user entities
  selectEntities: selectScorecardEntities,

  // select the array of users
  selectAll: selectAllScorecard,

  // select the total user count
  selectTotal: selectScorecardTotal
} = adapter.getSelectors();
