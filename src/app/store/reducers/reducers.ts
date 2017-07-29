import {ActionReducerMap} from '@ngrx/store';
import {uiState} from './uiStateReducer';
import {storeData} from './StoreDataReducer';
/**
 * Created by kelvin on 7/29/17.
 */
export interface State {
  uiState: any;
  storeData: any;
}

export const reducers: ActionReducerMap<State> = {
  uiState: uiState,
  storeData: storeData,
};
