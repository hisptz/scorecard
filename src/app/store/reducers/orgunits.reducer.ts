import * as orgunitActions from '../actions/orgunits.actions';

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
  action: orgunitActions.OrgunitsActions
): OrgunitState {
  switch (action.type) {

    case ( orgunitActions.LOAD_ORGANASATION_UNIT_ITEMS ): {
      return {...state, loading: true };
    }

    case ( orgunitActions.DONE_LOADING_ORGANASATION_UNIT_ITEMS ): {
      return {...state, loading: false, loaded: true };
    }

    case ( orgunitActions.DONE_LOADING_ORGANASATION_UNITS ): {
      const nodes = action.payload;
      return {...state, nodes };
    }

    case ( orgunitActions.DONE_LOADING_ORGANASATION_UNIT_GROUPS ): {
      const groups = action.payload;
      return {...state, groups };
    }

    case ( orgunitActions.DONE_LOADING_ORGANASATION_UNIT_LEVELS ): {
      const levels = action.payload;
      return {...state, levels };
    }

    case ( orgunitActions.DONE_LOADING_USER_ORGANASATION_UNITS ): {
      const user_orgunits = action.payload;
      return {...state, user_orgunits };
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
