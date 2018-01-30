import {Action} from '@ngrx/store';
import {EventData} from '../../shared/services/event-data.service';

export const LOAD_EVENT_GROUP = '[EventGroups] Load EventGroups';
export const LOAD_EVENT_GROUP_FAIL = '[EventGroups] Load EventGroups Fail';
export const LOAD_EVENT_GROUP_COMPLETE = '[EventGroups] Load EventGroups Complete';

export class LoadEventGroups implements Action {
  readonly type = LOAD_EVENT_GROUP;
}

export class LoadEventGroupsFail implements Action {
  readonly type = LOAD_EVENT_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class LoadEventGroupsSuccess implements Action {
  readonly type = LOAD_EVENT_GROUP_COMPLETE;
  constructor(public payload: EventData[]) {}
}

export type EventGroupsActions = LoadEventGroups| LoadEventGroupsFail | LoadEventGroupsSuccess;
