import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as IndicatorGroupActions from '../actions/indicatorGroup.actions';
import {IndicatorGroup} from '../../shared/services/indicator-group.service';

export interface IndicatorGroupState extends EntityState<IndicatorGroup> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: IndicatorGroup, b: IndicatorGroup): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<IndicatorGroup> = createEntityAdapter<IndicatorGroup>({
  sortComparer: sortByName,
});

export const initialState: IndicatorGroupState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function indicatorGroupReducer(
  state = initialState,
  action: IndicatorGroupActions.IndicatorGroupsActions
): IndicatorGroupState {
  switch (action.type) {
    case (IndicatorGroupActions.LOAD_INDICATOR_GROUP): {
      return {
        ...state,
        loading: true
      };
    }

    case (IndicatorGroupActions.LOAD_INDICATOR_GROUP_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (IndicatorGroupActions.LOAD_INDICATOR_GROUP_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getIndicatorGroupsLoading = (state: IndicatorGroupState) => state.loading;
export const getIndicatorGroupsLoaded = (state: IndicatorGroupState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectIndicatorGroupsEntities,

  // select the array of users
  selectAll: selectAllIndicatorGroups,

} = adapter.getSelectors();
