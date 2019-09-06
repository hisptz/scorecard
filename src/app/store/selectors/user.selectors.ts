import { createSelector } from '@ngrx/store';

import { User } from '../../core';
import { getRootState, State } from '../reducers';
import { UserState } from '../states/user.state';

export const getUserState = createSelector(
  getRootState,
  (state: State) => state.user
);

export const getCurrentUser = createSelector(
  getUserState,
  (state: UserState) => state.currentUser
);

export const getCurrentUserLoading = createSelector(
  getUserState,
  (state: UserState) => state.loading
);

export const getCurrentUserLoaded = createSelector(
  getUserState,
  (state: UserState) => state.loaded
);

export const getCurrentUserLoadingError = createSelector(
  getUserState,
  (state: UserState) => state.error
);

export const getCurrentUserManagementAuthoritiesStatus = createSelector(
  getCurrentUser,
  (currentUser: User) => {
    if (!currentUser) {
      return false;
    }

    return currentUser && currentUser.authorities
      ? currentUser.authorities.includes('ALL')
      : false;
  }
);
