import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as functionActions from '../actions/functions.actions';
import {FunctionObject} from '../../shared/models/function-object';

export interface FunctionState extends EntityState<FunctionObject> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: FunctionObject, b: FunctionObject): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<FunctionObject> = createEntityAdapter<FunctionObject>({
  sortComparer: sortByName,
});

export const initialState: FunctionState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function functionReducer(
  state = initialState,
  action: functionActions.FunctionsActions
): FunctionState {
  switch (action.type) {
    case (functionActions.LOAD_FUNCTIONS): {
      return {
        ...state,
        loading: true
      };
    }

    case (functionActions.LOAD_FUNCTIONS_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (functionActions.LOAD_FUNCTIONS_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getFunctionLoading = (state: FunctionState) => state.loading;
export const getFunctionLoaded = (state: FunctionState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectFunctionEntities,

  // select the array of users
  selectAll: selectAllFunction,

} = adapter.getSelectors();
