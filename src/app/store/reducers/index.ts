import {ActionReducerMap, createFeatureSelector, MetaReducer} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import {storeFreeze} from 'ngrx-store-freeze';
import {uiReducer, UiState} from './ui.reducer';
import {RouterStateUrl} from './router.reducer';
import {environment} from '../../../environments/environment';

export  interface ApplicationState {
  uiState: UiState;
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}
export const reducers: ActionReducerMap<ApplicationState> = {
  uiState: uiReducer,
  routerReducer: fromRouter.routerReducer,
};

export const metaReducers: MetaReducer<ApplicationState>[] = !environment.production ? [storeFreeze] : [];

export const getRouterState = createFeatureSelector<fromRouter.RouterReducerState<RouterStateUrl>>('routerReducer');

export const getUiState = createFeatureSelector<UiState>('uiState');


