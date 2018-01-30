import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as orgUnitGroupActions from '../actions/orgUnitGroup.actions';
import {OrganisationUnitGroup} from '../../shared/models/organisationUnitGroup';

export interface OrgUnitGroupState extends EntityState<OrganisationUnitGroup> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: OrganisationUnitGroup, b: OrganisationUnitGroup): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<OrganisationUnitGroup> = createEntityAdapter<OrganisationUnitGroup>({
  sortComparer: sortByName,
});

export const initialState: OrgUnitGroupState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function orgUnitGroupReducer(
  state = initialState,
  action: orgUnitGroupActions.OrgUnitGroupsActions
): OrgUnitGroupState {
  switch (action.type) {
    case (orgUnitGroupActions.LOAD_ORGANISATION_UNIT_GROUPS): {
      return {
        ...state,
        loading: true
      };
    }

    case (orgUnitGroupActions.LOAD_ORGANISATION_UNIT_GROUPS_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (orgUnitGroupActions.LOAD_ORGANISATION_UNIT_GROUPS_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getOrgUnitGroupsLoading = (state: OrgUnitGroupState) => state.loading;
export const getOrgUnitGroupsLoaded = (state: OrgUnitGroupState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectOrgUnitGroupsEntities,

  // select the array of users
  selectAll: selectAllOrgUnitGroups,

} = adapter.getSelectors();
