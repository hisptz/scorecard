import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as ProgramIndicatorActions from '../actions/programIndicator.actions';
import {ProgramIndicatorGroups} from '../../shared/services/program-indicators.service';

export interface ProgramIndicatorState extends EntityState<ProgramIndicatorGroups> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: ProgramIndicatorGroups, b: ProgramIndicatorGroups): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<ProgramIndicatorGroups> = createEntityAdapter<ProgramIndicatorGroups>({
  sortComparer: sortByName,
});

export const initialState: ProgramIndicatorState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function programIndicatorGroupReducer(
  state = initialState,
  action: ProgramIndicatorActions.ProgramIndicatorGroupActions
): ProgramIndicatorState {
  switch (action.type) {
    case (ProgramIndicatorActions.LOAD_PROGRAM_INDICATOR_GROUP): {
      return {
        ...state,
        loading: true
      };
    }

    case (ProgramIndicatorActions.LOAD_PROGRAM_INDICATOR_GROUP_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (ProgramIndicatorActions.LOAD_PROGRAM_INDICATOR_GROUP_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getProgramIndicatorsLoading = (state: ProgramIndicatorState) => state.loading;
export const getProgramIndicatorsLoaded = (state: ProgramIndicatorState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectProgramIndicatorsEntities,

  // select the array of users
  selectAll: selectAllProgramIndicators,

} = adapter.getSelectors();
