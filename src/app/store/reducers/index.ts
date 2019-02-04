import {ActionReducerMap, createFeatureSelector, MetaReducer} from '@ngrx/store';
import {scorecardReducer, ScorecardState} from './scorecard.reducer';
import {uiReducer, UiState} from './ui.reducer';
import * as fromRouter from '@ngrx/router-store';
import {RouterStateUrl} from './router.reducer';
import {CreatedScorecardState, createReducer} from './create.reducer';
import {staticDataReducer, StaticDataState} from './static-data.reducer';
import {orgunitReducer, OrgunitState} from './orgunits.reducer';
import {viewReducer, ViewScorecardState} from './view.reducer';
import {environment} from '../../../environments/environment';
import {storeFreeze} from 'ngrx-store-freeze';

export  interface ApplicationState {
  scorecards: ScorecardState;
  uiState: UiState;
  staticData: StaticDataState;
  orgunits: OrgunitState;
  createdScorecard: CreatedScorecardState;
  viewedScorecard: ViewScorecardState;
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}
export const reducers: ActionReducerMap<ApplicationState> = {
  scorecards: scorecardReducer,
  uiState: uiReducer,
  staticData: staticDataReducer,
  orgunits: orgunitReducer,
  createdScorecard: createReducer,
  viewedScorecard: viewReducer,
  routerReducer: fromRouter.routerReducer,
};

export const metaReducers: MetaReducer<ApplicationState>[] = !environment.production ? [storeFreeze] : [];

export const getRouterState = createFeatureSelector<
  fromRouter.RouterReducerState<RouterStateUrl>
  >('routerReducer');

export const getUiState = createFeatureSelector<UiState>('uiState');

export const getScorecardState = createFeatureSelector<ScorecardState>('scorecards');

export const getCreateadState = createFeatureSelector<CreatedScorecardState>('createdScorecard');

export const getViewedState = createFeatureSelector<ViewScorecardState>('viewedScorecard');

export const getStaticData = createFeatureSelector<StaticDataState>('staticData');

export const getOrgunitState = createFeatureSelector<OrgunitState>('orgunits');

