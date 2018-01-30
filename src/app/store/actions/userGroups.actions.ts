import {Action} from '@ngrx/store';
import {UserGroup} from '../../shared/models/user-group';

export const LOAD_USER_GROUP = '[User Group] Load User Group';
export const LOAD_USER_GROUP_FAIL = '[User Group] Load User Group Fail';
export const LOAD_USER_GROUP_COMPLETE = '[User Group] Load User Group Complete';

export class LoadUserGroups implements Action {
  readonly type = LOAD_USER_GROUP;
}

export class LoadUserGroupsFail implements Action {
  readonly type = LOAD_USER_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class LoadUserGroupsSuccess implements Action {
  readonly type = LOAD_USER_GROUP_COMPLETE;
  constructor(public payload: UserGroup[]) {}
}

export type UserGroupActions = LoadUserGroups | LoadUserGroupsFail | LoadUserGroupsSuccess;
