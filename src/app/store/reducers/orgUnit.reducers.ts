import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as orgUnitActions from '../actions/orgUnit.actions';
import {OrganisationUnit} from '../../shared/models/organisationUnit';

export interface OrgUnitState extends EntityState<OrganisationUnit> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: OrganisationUnit, b: OrganisationUnit): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<OrganisationUnit> = createEntityAdapter<OrganisationUnit>({
  sortComparer: sortByName,
});

export const initialState: OrgUnitState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function orgUnitReducer(
  state = initialState,
  action: orgUnitActions.OrgUnitsActions
): OrgUnitState {
  switch (action.type) {
    case (orgUnitActions.LOAD_ORGANISATION_UNIT): {
      return {
        ...state,
        loading: true
      };
    }

    case (orgUnitActions.LOAD_ORGANISATION_UNIT_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (orgUnitActions.LOAD_ORGANISATION_UNIT_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getOrgUnitsLoading = (state: OrgUnitState) => state.loading;
export const getOrgUnitsLoaded = (state: OrgUnitState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectOrgUnitsEntities,

  // select the array of users
  selectAll: selectAllOrgUnits,

} = adapter.getSelectors();
