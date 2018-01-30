import {Action} from '@ngrx/store';
import {EventData} from '../../shared/services/event-data.service';

export const LOAD_INDICATOR_GROUP = '[IndicatorGroups] Load IndicatorGroups';
export const LOAD_INDICATOR_GROUP_FAIL = '[IndicatorGroups] Load IndicatorGroups Fail';
export const LOAD_INDICATOR_GROUP_COMPLETE = '[IndicatorGroups] Load IndicatorGroups Complete';

export class LoadIndicatorGroups implements Action {
  readonly type = LOAD_INDICATOR_GROUP;
}

export class LoadIndicatorGroupsFail implements Action {
  readonly type = LOAD_INDICATOR_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class LoadIndicatorGroupsSuccess implements Action {
  readonly type = LOAD_INDICATOR_GROUP_COMPLETE;
  constructor(public payload: EventData[]) {}
}

export type IndicatorGroupsActions = LoadIndicatorGroups| LoadIndicatorGroupsFail | LoadIndicatorGroupsSuccess;
