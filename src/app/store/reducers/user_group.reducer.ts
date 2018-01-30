import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import {UserGroup} from '../../shared/models/user-group';
import * as groupActions from '../actions/userGroups.actions';

export interface UserGroupState extends EntityState<UserGroup> {
  loaded: boolean;
  loading: boolean;
}

export function sortByName(a: UserGroup, b: UserGroup): number {
  return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<UserGroup> = createEntityAdapter<UserGroup>({
  sortComparer: sortByName,
});

export const initialState: UserGroupState = adapter.getInitialState({
  loaded: false,
  loading: false,
});

export function userGroupReducer(
  state = initialState,
  action: groupActions.UserGroupActions
): UserGroupState {
  switch (action.type) {
    case (groupActions.LOAD_USER_GROUP): {
      return {
        ...state,
        loading: true
      };
    }

    case (groupActions.LOAD_USER_GROUP_COMPLETE): {
      return adapter.addAll(action.payload, { ...state, loaded: true, loading: false });
    }

    case (groupActions.LOAD_USER_GROUP_FAIL): {
      return {
        ...state,
        loading: false,
        loaded: false
      };
    }
  }

  return state;
}

export const getUserGroupLoading = (state: UserGroupState) => state.loading;
export const getUserGroupLoaded = (state: UserGroupState) => state.loaded;
export const {
  // select the dictionary of user entities
  selectEntities: selectUserGroupEntities,

  // select the array of users
  selectAll: selectAllUserGroup,

} = adapter.getSelectors();
