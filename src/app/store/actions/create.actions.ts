import { Action } from '@ngrx/store';
import { ScoreCard } from '../../shared/models/scorecard';
import { IndicatorHolderGroup } from '../../shared/models/indicator-holders-group';
import { IndicatorHolder } from '../../shared/models/indicator-holder';

export const SET_CREATED_SCORECARD = '[Create] Set Created Scorecard';
export const GET_SCORECARD_TO_CREATE = '[Create] Get Scorecard to create';
export const SET_CURRENT_INDICATOR_HOLDER = '[Create] Set Current Indicator holder';
export const SET_CURRENT_GROUP = '[Create] Set Current Group';
export const SET_NEXT_GROUP_ID = '[Create] Set Next Group Id';
export const SET_NEXT_HOLDER_ID = '[Create] Set Next Holder Id';
export const SET_NEED_FOR_INDICATOR = '[Create] Set Need for Indicator';
export const SET_NEED_FOR_GROUP = '[Create] Set Need for Group';

export const SET_ITEM = '[Create] Set Item';


export class SetCreatedScorecard implements Action {
  readonly type = SET_CREATED_SCORECARD;
  constructor(public payload: ScoreCard) {}
}

export class SetCurrentIndicatorHolder implements Action {
  readonly type = SET_CURRENT_INDICATOR_HOLDER;
  constructor(public payload: IndicatorHolder) {}
}

export class SetCurrentGroup implements Action {
  readonly type = SET_CURRENT_GROUP;
  constructor(public payload: IndicatorHolderGroup) {}
}

export class SetNextGroupId implements Action {
  readonly type = SET_NEXT_GROUP_ID;
  constructor(public payload: number) {}
}

export class SetNextHolderId implements Action {
  readonly type = SET_NEXT_HOLDER_ID;
  constructor(public payload: number) {}
}

export class SetNeedForIndicator implements Action {
  readonly type = SET_NEED_FOR_INDICATOR;
  constructor(public payload: boolean) {}
}

export class SetNeedForGroup implements Action {
  readonly type = SET_NEED_FOR_GROUP;
  constructor(public payload: boolean) {}
}

export class SetItem implements Action {
  readonly type = SET_ITEM;
  constructor(public payload: {key: any, value: any}) {}
}

export class GetScorecardToCreate implements Action {
  readonly type = GET_SCORECARD_TO_CREATE;
}


export type Actions =
  SetCreatedScorecard
  | GetScorecardToCreate
  | SetCurrentIndicatorHolder
  | SetCurrentGroup
  | SetNextGroupId
  | SetNextHolderId
  | SetNeedForIndicator
  | SetNeedForGroup
  | SetItem;
