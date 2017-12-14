import {ScoreCard} from '../../shared/models/scorecard';
import * as createActions from '../actions/create.actions';
import {IndicatorHolder} from '../../shared/models/indicator-holder';
import {IndicatorHolderGroup} from '../../shared/models/indicator-holders-group';

export interface CreatedScorecardState {
  scorecard: ScoreCard;
  need_for_group: boolean;
  current_indicator_holder: IndicatorHolder;
  current_group: IndicatorHolderGroup;
  next_group_id: number;
  next_holder_id: number;
  need_for_indicator: boolean;
}

export const InitialCreateState = {
  scorecard: null,
  need_for_group: false,
  current_indicator_holder: null,
  current_group: null,
  next_group_id: null,
  next_holder_id: null,
  need_for_indicator: false
};

export function createReducer(
  state = InitialCreateState,
  action: createActions.Actions
): CreatedScorecardState {

  switch (action.type) {
    case (createActions.SET_CREATED_SCORECARD): {
      const scorecard = action.payload;
      return {...state, scorecard  };
    }

    case (createActions.SET_CURRENT_GROUP): {
      return {...state, current_group: action.payload };
    }

    case (createActions.SET_CURRENT_INDICATOR_HOLDER): {
      return {...state, current_indicator_holder: action.payload };
    }

    case (createActions.SET_NEXT_GROUP_ID): {
      return {...state, next_group_id: action.payload };
    }

    case (createActions.SET_NEXT_HOLDER_ID): {
      return {...state, next_holder_id: action.payload };
    }

    case (createActions.SET_NEED_FOR_INDICATOR): {
      return {...state, need_for_indicator: action.payload };
    }

    case (createActions.SET_NEED_FOR_GROUP): {
      return {...state, need_for_group: action.payload };
    }

    case (createActions.SET_ITEM): {
      return {...state, [action.payload.key]: action.payload.value };
    }
  }
  return state;
}


export const getCreatedScorecard = (state: CreatedScorecardState) => state.scorecard;
export const getNeedForGroup = (state: CreatedScorecardState) => state.need_for_group;
export const getNeedForIndicator = (state: CreatedScorecardState) => state.need_for_indicator;
export const getCurrentIndicatorHolder = (state: CreatedScorecardState) => state.current_indicator_holder;
export const getCurrentGroup = (state: CreatedScorecardState) => state.current_group;
export const getNextGroupId = (state: CreatedScorecardState) => state.next_group_id;
export const getNextHolderId = (state: CreatedScorecardState) => state.next_holder_id;
