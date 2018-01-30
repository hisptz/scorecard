import { Action } from '@ngrx/store';
import {User} from '../../shared/models/user';

export const LOAD_USER = '[User] Load User';
export const LOAD_USER_SUCCESS = '[User] Load User Success';
export const LOAD_USER_FAILURE = '[User] Load User Failure';

export class LoadUser implements Action{
  readonly type = LOAD_USER;
}

export class LoadUserSuccess implements Action{
  readonly type = LOAD_USER_SUCCESS;
  constructor(public payload: User) {}
}

export class LoadUserFailure implements Action{
  readonly type = LOAD_USER_FAILURE;
  constructor(public payload: any) {}
}

export type UserActions = LoadUser | LoadUserSuccess | LoadUserFailure;
