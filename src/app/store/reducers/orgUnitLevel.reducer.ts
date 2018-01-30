import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as orgUnitLevelActions from '../actions/orgunitLevels.actions';
import {OrganisationUnitLevel} from '../../shared/models/organisationUnitLevel';

export interface OrgUnitLevelState extends EntityState<OrganisationUnitLevel> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<OrganisationUnitLevel> = createEntityAdapter<OrganisationUnitLevel>();

export const initialState: OrgUnitLevelState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function orgUnitLevelReducer(
  state = initialState,
  action: orgUnitLevelActions.OrgUnitLevelsActions
): OrgUnitLevelState {
  switch (action.type) {
    case (orgUnitLevelActions.LOAD_ORGANISATION_UNIT_LEVELS): {
      return {
        ...state,
        loading: true
      };
    }

    case (orgUnitLevelActions.LOAD_ORGANISATION_UNIT_LEVELS_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (orgUnitLevelActions.LOAD_ORGANISATION_UNIT_LEVELS_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getOrgUnitLevelsLoading = (state: OrgUnitLevelState) => state.loading;
export const getOrgUnitLevelsLoaded = (state: OrgUnitLevelState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectOrgUnitLevelsEntities,

  // select the array of users
  selectAll: selectAllOrgUnitLevels,

} = adapter.getSelectors();
