import {ActionReducerMap, createFeatureSelector} from '@ngrx/store';
import {scorecardReducer, ScorecardState} from './scorecard.reducer';
import {uiReducer, UiState} from './ui.reducer';
import * as fromRouter from '@ngrx/router-store';
import {RouterStateUrl} from './router.reducer';
import {CreatedScorecardState, createReducer} from "./create.reducer";
import {staticDataReducer, StaticDataState} from "./static-data.reducer";

export  interface ApplicationState {
  scorecards: ScorecardState;
  uiState: UiState;
  staticData: StaticDataState,
  createdScorecard: CreatedScorecardState,
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}
export const reducers: ActionReducerMap<ApplicationState> = {
  scorecards: scorecardReducer,
  uiState: uiReducer,
  staticData: staticDataReducer,
  createdScorecard: createReducer,
  routerReducer: fromRouter.routerReducer,
};


export const getRouterState = createFeatureSelector<
  fromRouter.RouterReducerState<RouterStateUrl>
  >('routerReducer');

export const getUiState = createFeatureSelector<UiState>('uiState');

export const getScorecardState = createFeatureSelector<ScorecardState>('scorecards');

export const getCreateadState = createFeatureSelector<CreatedScorecardState>('createdScorecard');

export const getStaticData = createFeatureSelector<CreatedScorecardState>('staticData');

