import {Action} from '@ngrx/store';
import {DataElementGroup} from '../../shared/services/data-element-group.service';

export const LOAD_DATA_ELEMENT_GROUP = '[DataElementGroups] Load DataElementGroups';
export const LOAD_DATA_ELEMENT_GROUP_FAIL = '[DataElementGroups] Load DataElementGroups Fail';
export const LOAD_DATA_ELEMENT_GROUP_COMPLETE = '[DataElementGroups] Load DataElementGroups Complete';

export class LoadDataElementGroups implements Action {
  readonly type = LOAD_DATA_ELEMENT_GROUP;
}

export class LoadDataElementGroupsFail implements Action {
  readonly type = LOAD_DATA_ELEMENT_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class LoadDataElementGroupsSuccess implements Action {
  readonly type = LOAD_DATA_ELEMENT_GROUP_COMPLETE;
  constructor(public payload: DataElementGroup[]) {}
}

export type DataElementGroupsActions = LoadDataElementGroups| LoadDataElementGroupsFail | LoadDataElementGroupsSuccess;
