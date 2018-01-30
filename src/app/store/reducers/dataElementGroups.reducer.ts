import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as DataElementActions from '../actions/dataelement.actions';
import {DataElementGroup} from '../../shared/services/data-element-group.service';

export interface DataElementState extends EntityState<DataElementGroup> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: DataElementGroup, b: DataElementGroup): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<DataElementGroup> = createEntityAdapter<DataElementGroup>({
  sortComparer: sortByName,
});

export const initialState: DataElementState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function dataElementReducer(
  state = initialState,
  action: DataElementActions.DataElementGroupsActions
): DataElementState {
  switch (action.type) {
    case (DataElementActions.LOAD_DATA_ELEMENT_GROUP): {
      return {
        ...state,
        loading: true
      };
    }

    case (DataElementActions.LOAD_DATA_ELEMENT_GROUP_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (DataElementActions.LOAD_DATA_ELEMENT_GROUP_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getDataElementsLoading = (state: DataElementState) => state.loading;
export const getDataElementsLoaded = (state: DataElementState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectDataElementsEntities,

  // select the array of users
  selectAll: selectAllDataElements,

} = adapter.getSelectors();
