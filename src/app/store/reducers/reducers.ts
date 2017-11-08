import {ActionReducerMap} from '@ngrx/store';
import {uiState} from './uiStateReducer';
import {storeData} from './StoreDataReducer';
import {ApplicationState} from '../application.state';
import {indicatorPreview} from './indicatorPreview';
/**
 * Created by kelvin on 7/29/17.
 */

export const reducers: ActionReducerMap<ApplicationState> = {
  uiState: uiState,
  indicatorPreview: indicatorPreview,
  storeData: storeData,
};
