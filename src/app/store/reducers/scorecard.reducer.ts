import {ScoreCard} from '../../shared/models/scorecard';
import * as scorecardActions from '../actions/scorecard.actions';

export interface ScorecardState {
  entities: {[id: string]: ScoreCard};
  loaded: boolean;
  loading: boolean;
}

export const initialState: ScorecardState = {
  entities: {},
  loaded: false,
  loading: false,
};

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

      const scorecard = action.payload;
      const entities = {
        ...state.entities,
        [scorecard.id]: scorecard,
      };


      return {
        ...state,
        entities,
      };
    }

    // this will be called once a scorecard has been removed successful
    case scorecardActions.REMOVE_SCORECARD_SUCCESS: {
      const scorecard = action.payload;
      const { [scorecard.id]: removed, ...entities } = state.entities;

      return {
        ...state,
        entities,
      };
    }
  }

  return state;
}

// scorecard high level selectors from its state
export const getScorecardEntities = (state: ScorecardState) => { return {...state.entities} };
export const getScorecardLoading = (state: ScorecardState) => state.loading;
export const getScorecardLoaded = (state: ScorecardState) => state.loaded;
