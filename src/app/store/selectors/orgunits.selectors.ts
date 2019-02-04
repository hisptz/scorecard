import { createSelector } from '@ngrx/store';
import {getOrgunitState} from '../reducers';
import * as orgunitSelectors from '../reducers/orgunits.reducer';


export const getOrgunitGroups = createSelector(getOrgunitState, orgunitSelectors.getOrgunitGroups);
export const getOrgunitLevels = createSelector(getOrgunitState, orgunitSelectors.getOrgunitLevels);
export const getOrgunitNodes = createSelector(getOrgunitState, orgunitSelectors.getOrgunitNodes);
export const getUserOrgunit = createSelector(getOrgunitState, orgunitSelectors.getUserOrgunit);
export const getOrgunitLoading = createSelector(getOrgunitState, orgunitSelectors.getOrgunitLoading);
export const getOrgunitLoaded = createSelector(getOrgunitState, orgunitSelectors.getOrgunitLoaded);
