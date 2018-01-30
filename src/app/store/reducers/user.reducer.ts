import {User} from '../../shared/models/user';
import * as userActions from '../actions/user.actions';

export interface UserState {
  user: User;
  loaded: boolean;
}

export const InitialUserState: UserState = {
  user: null,
  loaded: false
};

export function userReducer(
  state = InitialUserState,
  action: userActions.UserActions
): UserState {
  switch (action.type) {
    case (userActions.LOAD_USER_SUCCESS): {
      return {
        ...state,
        user: action.payload,
        loaded: true
      };
    }
    case (userActions.LOAD_USER_FAILURE): {
      return {
        ...state,
        loaded: false
      };
    }
  }
  return state;
}

export const getUser = (state: UserState) => state.user;
export const getUserLoaded = (state: UserState) => state.loaded;
