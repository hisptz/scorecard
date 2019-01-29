import { createSelector } from '@ngrx/store';
import * as dataSelectors from '../reducers/static-data.reducer';
import { getStaticData } from '../reducers';

export const getUserGroups = createSelector(getStaticData, dataSelectors.getUserGroups);
export const getUserGroupsLoaded = createSelector(getStaticData, dataSelectors.getUserGroupsLoaded);
export const getUser = createSelector(getStaticData, dataSelectors.getUser);
export const getUserLoaded = createSelector(getStaticData, dataSelectors.getUserLoaded);
export const getFunctions = createSelector(getStaticData, dataSelectors.getFunctions);
export const getFunctionsLoaded = createSelector(getStaticData, dataSelectors.getFunctionsLoaded);
