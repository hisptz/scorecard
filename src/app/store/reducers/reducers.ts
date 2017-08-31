import {ActionReducerMap} from '@ngrx/store';
import {uiState} from './uiStateReducer';
import {storeData} from './StoreDataReducer';
import {ApplicationState} from '../application.state';
/**
 * Created by kelvin on 7/29/17.
 */

export const reducers: ActionReducerMap<ApplicationState> = {
  uiState: uiState,
  storeData: storeData,
};
