import {
  DONE_LOADING_ORGANASATION_UNIT_ITEMS, LOAD_ORGANASATION_UNIT_ITEMS,
  OrgunitsActions
} from '../actions/orgunits.actions';

export interface OrgunitState {
  groups: any[];
  levels: any[];
  nodes: any;
  user_orgunits: any[];
  loading: boolean;
  loaded: boolean;
}

export const InitialOrgunitState: OrgunitState = {
  groups: [],
  levels: [],
  nodes: null,
  user_orgunits: [],
  loading: false,
  loaded: false,
};

export function orgunitReducer (
  state = InitialOrgunitState,
  action: OrgunitsActions
): OrgunitState {
  switch (action.type) {

    case ( LOAD_ORGANASATION_UNIT_ITEMS ): {
      return {...state, loading: true };
    }

    case ( DONE_LOADING_ORGANASATION_UNIT_ITEMS ): {
      return {...state, [action.payload.key]: action.payload.value };
    }
  }
  return state;
}

export const getOrgunitGroups = (state: OrgunitState) => state.groups;
export const getOrgunitLevels = (state: OrgunitState) => state.levels;
export const getOrgunitNodes = (state: OrgunitState) => state.nodes;
export const getUserOrgunit = (state: OrgunitState) => state.user_orgunits;
export const getOrgunitLoading = (state: OrgunitState) => state.loading;
export const getOrgunitLoaded = (state: OrgunitState) => state.loaded;
