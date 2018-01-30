import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as DatasetActions from '../actions/datasets.actions';
import {Dataset} from '../../shared/services/dataset.service';

export interface DatasetState extends EntityState<Dataset> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: Dataset, b: Dataset): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<Dataset> = createEntityAdapter<Dataset>({
  sortComparer: sortByName,
});

export const initialState: DatasetState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function datasetReducer(
  state = initialState,
  action: DatasetActions.DatasetsActions
): DatasetState {
  switch (action.type) {
    case (DatasetActions.LOAD_DATASET): {
      return {
        ...state,
        loading: true
      };
    }

    case (DatasetActions.LOAD_DATASET_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (DatasetActions.LOAD_DATASET_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getDatasetsLoading = (state: DatasetState) => state.loading;
export const getDatasetsLoaded = (state: DatasetState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectDatasetsEntities,

  // select the array of users
  selectAll: selectAllDatasets,

} = adapter.getSelectors();
