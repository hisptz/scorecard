import { createAction, props } from '@ngrx/store';

import { ErrorMessage, SystemInfo, User } from '../../core';

export enum UserActionTypes {
  LoadCurrentUser = '[User] Load current User',
  AddCurrentUser = '[User] Add Current User',
  LoadCurrentUserFail = '[User] Load Current User fail'
}

export const loadCurrentUser = createAction(
  '[User] Load current User',
  props<{ systemInfo: SystemInfo }>()
);

export const addCurrentUser = createAction(
  '[User] Add Current User',
  props<{ currentUser: User; systemInfo: SystemInfo }>()
);

export const loadCurrentUserFail = createAction(
  '[User] Load Current User fail',
  props<{ error: ErrorMessage }>()
);
