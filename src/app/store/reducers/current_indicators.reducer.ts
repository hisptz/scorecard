import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as CurrentIndicatorActions from '../actions/current_indicators.actions';
import {IndicatorObject} from '../../shared/models/indicator-object';

export interface CurrentIndicatorState extends EntityState<IndicatorObject> {}


export const adapter: EntityAdapter<IndicatorObject> = createEntityAdapter<IndicatorObject>();

export const initialState: CurrentIndicatorState = adapter.getInitialState({});

export function currentIndicatorsReducer(
  state = initialState,
  action: CurrentIndicatorActions.Actions
): CurrentIndicatorState {
  switch (action.type) {

    // this will be called once a single scorecard has been called successful
    case (CurrentIndicatorActions.LOAD_CURRENT_INDICATOR_SUCCESS): {
      return adapter.addOne(action.payload, state);
    }

    // this will be called once a single scorecard has been called successful
    case (CurrentIndicatorActions.UPDATE_CURRENT_INDICATOR_SUCCESS): {
      return adapter.updateOne(action.payload, state);
    }

    // this will be called once a scorecard has been removed successful
    case CurrentIndicatorActions.REMOVE_CURRENT_INDICATOR_SUCCESS: {
      return adapter.removeOne(action.payload, state);
    }
  }

  return state;
}

export const {
  // select the dictionary of user entities
  selectEntities: selectCurrentIndicatorEntities,

  // select the array of users
  selectAll: selectAllCurrentIndicator
} = adapter.getSelectors();
