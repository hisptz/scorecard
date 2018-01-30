import {createSelector} from '@ngrx/store';
import {
  getDataelementGroupsState, getDatasetsState, getEventDataState,
  getFunctionstate, getIndicatorGroupsState, getOrgUniLevelstate, getOrgUnitGroupstate, getOrgUnitState,
  getProgramIndicatorGroupState,
  getUserGroupState
} from '../reducers/index';
import * as fromUserGroup from '../reducers/user_group.reducer';
import * as fromFunction from '../reducers/functions.reducer';
import * as fromIndicaor from '../reducers/indicatorGroup.reducer';
import * as fromDataelement from '../reducers/dataElementGroups.reducer';
import * as fromDataset from '../reducers/datasets.reducer';
import * as fromEvent from '../reducers/events.reducer';
import * as fromProgram from '../reducers/programIndicator.reducer';
import * as fromOrgUnit from '../reducers/orgUnit.reducers';
import * as fromOrgUnitGroup from '../reducers/orgunit_groups.reducer';
import * as fromOrgUnitLevel from '../reducers/orgUnitLevel.reducer';

// User Groups
export const getAllUserGroups = createSelector(getUserGroupState, fromUserGroup.selectAllUserGroup);
export const getUserGroupsEntites = createSelector(getUserGroupState, fromUserGroup.selectUserGroupEntities);
export const getUserGroupsLoaded = createSelector(getUserGroupState, fromUserGroup.getUserGroupLoaded);
export const getUserGroupsLoading = createSelector(getUserGroupState, fromUserGroup.getUserGroupLoading);

// Functions
export const getAllFunctions = createSelector(getFunctionstate, fromFunction.selectAllFunction);
export const getFunctionsEntites = createSelector(getFunctionstate, fromFunction.selectFunctionEntities);
export const getFunctionsLoaded = createSelector(getFunctionstate, fromFunction.getFunctionLoaded);
export const getFunctionsLoading = createSelector(getFunctionstate, fromFunction.getFunctionLoading);

// Organisation Units
export const getAllOrgUnits = createSelector(getOrgUnitState, fromOrgUnit.selectAllOrgUnits);
export const getOrgUnitsEntites = createSelector(getOrgUnitState, fromOrgUnit.selectOrgUnitsEntities);
export const getOrgUnitsLoaded = createSelector(getOrgUnitState, fromOrgUnit.getOrgUnitsLoaded);
export const getOrgUnitsLoading = createSelector(getOrgUnitState, fromOrgUnit.getOrgUnitsLoading);

// Organisation Unit Groups
export const getAllOrgUnitsGroups = createSelector(getOrgUnitGroupstate, fromOrgUnitGroup.selectAllOrgUnitGroups);
export const getOrgUnitsGroupsEntites = createSelector(getOrgUnitGroupstate, fromOrgUnitGroup.selectOrgUnitGroupsEntities);
export const getOrgUnitsGroupsLoaded = createSelector(getOrgUnitGroupstate, fromOrgUnitGroup.getOrgUnitGroupsLoaded);
export const getOrgUnitsGroupsLoading = createSelector(getOrgUnitGroupstate, fromOrgUnitGroup.getOrgUnitGroupsLoading);

// Organisation Unit Levels
export const getAllOrgUnitLevels = createSelector(getOrgUniLevelstate, fromOrgUnitLevel.selectAllOrgUnitLevels);
export const getOrgUnitLevelsEntites = createSelector(getOrgUniLevelstate, fromOrgUnitLevel.selectOrgUnitLevelsEntities);
export const getOrgUnitLevelsLoaded = createSelector(getOrgUniLevelstate, fromOrgUnitLevel.getOrgUnitLevelsLoaded);
export const getOrgUnitLevelsLoading = createSelector(getOrgUniLevelstate, fromOrgUnitLevel.getOrgUnitLevelsLoading);

// Data elements Groups
export const getAllDataElementGroups = createSelector(getDataelementGroupsState, fromDataelement.selectAllDataElements);
export const getDataElementGroupsEntites = createSelector(getDataelementGroupsState, fromDataelement.selectDataElementsEntities);
export const getDataElementGroupsLoaded = createSelector(getDataelementGroupsState, fromDataelement.getDataElementsLoaded);
export const getDataElementGroupsLoading = createSelector(getDataelementGroupsState, fromDataelement.getDataElementsLoading);

// Indicator Groups
export const getAllIndicatorGroups = createSelector(getIndicatorGroupsState, fromIndicaor.selectAllIndicatorGroups);
export const getIndicatorGroupsEntites = createSelector(getIndicatorGroupsState, fromIndicaor.selectIndicatorGroupsEntities);
export const getIndicatorGroupsLoaded = createSelector(getIndicatorGroupsState, fromIndicaor.getIndicatorGroupsLoaded);
export const getIndicatorGroupsLoading = createSelector(getIndicatorGroupsState, fromIndicaor.getIndicatorGroupsLoading);

// Data sets
export const getAllDatasets = createSelector(getDatasetsState, fromDataset.selectAllDatasets);
export const getDatasetsEntites = createSelector(getDatasetsState, fromDataset.selectDatasetsEntities);
export const getlDatasetsLoaded = createSelector(getDatasetsState, fromDataset.getDatasetsLoaded);
export const getDatasetsLoading = createSelector(getDatasetsState, fromDataset.getDatasetsLoading);

// Events data
export const getAllEvents = createSelector(getEventDataState, fromEvent.selectAllEventData);
export const getEventsEntites = createSelector(getEventDataState, fromEvent.selectEventDataEntities);
export const getEventsLoaded = createSelector(getEventDataState, fromEvent.getEventDataLoaded);
export const getEventsLoading = createSelector(getEventDataState, fromEvent.getEventDataLoading);

// Program Indicators
export const getAllPrograms = createSelector(getProgramIndicatorGroupState, fromProgram.selectAllProgramIndicators);
export const getProgramsEntites = createSelector(getProgramIndicatorGroupState, fromProgram.selectProgramIndicatorsEntities);
export const getProgramsLoaded = createSelector(getProgramIndicatorGroupState, fromProgram.getProgramIndicatorsLoaded);
export const getProgramsLoading = createSelector(getProgramIndicatorGroupState, fromProgram.getProgramIndicatorsLoading);
