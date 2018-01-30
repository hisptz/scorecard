import {ActionReducerMap, createFeatureSelector, MetaReducer} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import {storeFreeze} from 'ngrx-store-freeze';
import {uiReducer, UiState} from './ui.reducer';
import {RouterStateUrl} from './router.reducer';
import {environment} from '../../../environments/environment';
import {userReducer, UserState} from './user.reducer';
import {scorecardReducer, ScorecardState} from './scorecard.reducer';
import {userGroupReducer, UserGroupState} from './user_group.reducer';
import {functionReducer, FunctionState} from './functions.reducer';
import {orgUnitGroupReducer, OrgUnitGroupState} from './orgunit_groups.reducer';
import {orgUnitLevelReducer, OrgUnitLevelState} from './orgUnitLevel.reducer';
import {orgUnitReducer, OrgUnitState} from './orgUnit.reducers';
import {dataElementReducer, DataElementState} from './dataElementGroups.reducer';
import {indicatorGroupReducer, IndicatorGroupState} from './indicatorGroup.reducer';
import {datasetReducer, DatasetState} from './datasets.reducer';
import {EventDataState, eventsReducer} from './events.reducer';
import {programIndicatorGroupReducer, ProgramIndicatorState} from './programIndicator.reducer';
import {currentIndicatorsReducer, CurrentIndicatorState} from "./current_indicators.reducer";

export  interface ApplicationState {
  user: UserState;
  scorecard: ScorecardState;
  uiState: UiState;
  userGroups: UserGroupState;
  functions: FunctionState;
  organisationUnits: OrgUnitState;
  organisationUnitGroups: OrgUnitGroupState;
  organisationUnitLevels: OrgUnitLevelState;
  dataElementGroups: DataElementState;
  indicatorGroups: IndicatorGroupState;
  datasets: DatasetState;
  events: EventDataState;
  programIndicatorGroups: ProgramIndicatorState;
  currentIndicators: CurrentIndicatorState;
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}
export const reducers: ActionReducerMap<ApplicationState> = {
  user: userReducer,
  scorecard: scorecardReducer,
  uiState: uiReducer,
  userGroups: userGroupReducer,
  functions: functionReducer,
  organisationUnits: orgUnitReducer,
  organisationUnitGroups: orgUnitGroupReducer,
  organisationUnitLevels: orgUnitLevelReducer,
  dataElementGroups: dataElementReducer,
  indicatorGroups: indicatorGroupReducer,
  datasets: datasetReducer,
  events: eventsReducer,
  programIndicatorGroups: programIndicatorGroupReducer,
  currentIndicators: currentIndicatorsReducer,
  routerReducer: fromRouter.routerReducer,
};

export const metaReducers: MetaReducer<ApplicationState>[] = !environment.production ? [storeFreeze] : [];

export const getRouterState = createFeatureSelector<fromRouter.RouterReducerState<RouterStateUrl>>('routerReducer');
export const getUiState = createFeatureSelector<UiState>('uiState');
export const getUserState = createFeatureSelector<UserState>('user');
export const getScorecardState = createFeatureSelector<ScorecardState>('scorecard');

export const getUserGroupState = createFeatureSelector<UserGroupState>('userGroups');
export const getFunctionstate = createFeatureSelector<FunctionState>('functions');
export const getOrgUnitState = createFeatureSelector<OrgUnitState>('organisationUnits');
export const getOrgUnitGroupstate = createFeatureSelector<OrgUnitGroupState>('organisationUnitGroups');
export const getOrgUniLevelstate = createFeatureSelector<OrgUnitLevelState>('organisationUnitLevels');
export const getDataelementGroupsState = createFeatureSelector<DataElementState>('dataElementGroups');
export const getIndicatorGroupsState = createFeatureSelector<IndicatorGroupState>('indicatorGroups');
export const getDatasetsState = createFeatureSelector<DatasetState>('datasets');
export const getProgramIndicatorGroupState = createFeatureSelector<ProgramIndicatorState>('programIndicatorGroups');
export const getEventDataState = createFeatureSelector<EventDataState>('events');

export const getCurrentIndicatorState = createFeatureSelector<CurrentIndicatorState>('currentIndicators');


