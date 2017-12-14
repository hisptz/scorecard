import {Action} from '@ngrx/store';
import {FunctionObject} from '../../shared/models/function-object';

export const LOAD_FUNCTIONS = '[Static Data] Load Functions';
export const LOAD_FUNCTIONS_DONE = '[Static Data] Load Functions Done';
export const LOAD_FUNCTIONS_FAIL = '[Static Data] Load Functions Fail';

export const LOAD_USER_GROUPS = '[Static Data] Load User Groups';
export const LOAD_USER_GROUPS_DONE = '[Static Data] Load User Groups Done';
export const LOAD_USER_GROUPS_FAIL = '[Static Data] Load User Groups Fail';

export const LOAD_USER = '[Static Data] Load Users';
export const LOAD_USER_DONE = '[Static Data] Load Users Done';
export const LOAD_USER_FAIL = '[Static Data] Load Users Fail';


export class LoadFunction implements Action {
  readonly type = LOAD_FUNCTIONS;
}

export class LoadFunctionDone implements Action {
  readonly type = LOAD_FUNCTIONS_DONE;
  constructor(public payload: FunctionObject[]) {}
}

export class LoadFunctionFail implements Action {
  readonly type = LOAD_FUNCTIONS_FAIL;
  constructor(public payload: any) {}
}

export class LoadUserGroups implements Action {
  readonly type = LOAD_USER_GROUPS;
}

export class LoadUserGroupsDone implements Action {
  readonly type = LOAD_USER_GROUPS_DONE;
  constructor(public payload: any) {}
}

export class LoadUserGroupsFail implements Action {
  readonly type = LOAD_USER_GROUPS_FAIL;
  constructor(public payload: any) {}
}

export class LoadUsers implements Action {
  readonly type = LOAD_USER;
}

export class LoadUsersDone implements Action {
  readonly type = LOAD_USER_DONE;
  constructor(public payload: any) {}
}

export class LoadUsersFail implements Action {
  readonly type = LOAD_USER_FAIL;
  constructor(public payload: any) {}
}

export type StaticDataActions =
  LoadFunction
  | LoadUsersFail
  | LoadUsersDone
  | LoadUsers
  | LoadUserGroupsFail
  | LoadUserGroupsDone
  | LoadUserGroups
  | LoadFunctionFail
  | LoadFunctionDone;
