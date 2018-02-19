import { Action } from '@ngrx/store';
import { ScoreCard } from '../../shared/models/scorecard';
import { IndicatorHolderGroup } from '../../shared/models/indicator-holders-group';
import { IndicatorHolder } from '../../shared/models/indicator-holder';
import {CreatedScorecardState} from '../reducers/create.reducer';

export const SET_CREATED_SCORECARD = '[Create] Set Created Scorecard';
export const GET_SCORECARD_TO_CREATE = '[Create] Get Scorecard to create';
export const SET_CURRENT_INDICATOR_HOLDER = '[Create] Set Current Indicator holder';
export const SET_CURRENT_GROUP = '[Create] Set Current Group';
export const SET_NEXT_GROUP_ID = '[Create] Set Next Group Id';
export const SET_NEXT_HOLDER_ID = '[Create] Set Next Holder Id';
export const SET_NEED_FOR_INDICATOR = '[Create] Set Need for Indicator';
export const SET_NEED_FOR_GROUP = '[Create] Set Need for Group';

export const SET_OPTIONS = '[Create] Set Options';
export const SET_ITEM = '[Create] Set configuration Item';
export const SET_LEGEND = '[Create] Set Legend';
export const SET_HEADER = '[Create] Set Header';
export const SET_HOLDERS = '[Create] Set Holders';
export const SET_USER_GROUP = '[Create] Set User Group';
export const SET_HOLDER_GROUPS = '[Create] Set Holder Groups';
export const SET_ADDITIONAL_LABELS = '[Create] Set Additional Labels';
export const SET_EDDITING_HEADER = '[Create] Set Editing Haader';
export const SET_ORGUNIT_SETTINGS = '[Create] Set Orgunit Settings';
export const SET_PERIOD_TYPE = '[Create] Set Period Type';
export const SET_SELECTED_PERIODS = '[Create] Set Selected Period';


export class SetCreatedScorecard implements Action {
  readonly type = SET_CREATED_SCORECARD;
  constructor(public payload: CreatedScorecardState) {}
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

export class SetLegend implements Action {
  readonly type = SET_LEGEND;
  constructor(public payload: any) {}
}

export class SetHeader implements Action {
  readonly type = SET_HEADER;
  constructor(public payload: any) {}
}

export class SetHolders implements Action {
  readonly type = SET_HOLDERS;
  constructor(public payload: any) {}
}

export class SetHoldersGroups implements Action {
  readonly type = SET_HOLDER_GROUPS;
  constructor(public payload: any) {}
}

export class SetAdditionalLabels implements Action {
  readonly type = SET_ADDITIONAL_LABELS;
  constructor(public payload: any) {}
}

export class SetEdditingHeader implements Action {
  readonly type = SET_EDDITING_HEADER;
  constructor(public payload: boolean) {}
}

export class SetOptions implements Action {
  readonly type = SET_OPTIONS;
  constructor(public payload: any) {}
}

export class SetOrgunitSettings implements Action {
  readonly type = SET_ORGUNIT_SETTINGS;
  constructor(public payload: any) {}
}

export class SetPeriodType implements Action {
  readonly type = SET_PERIOD_TYPE;
  constructor(public payload: any) {}
}

export class SetSelectedPeriod implements Action {
  readonly type = SET_SELECTED_PERIODS;
  constructor(public payload: any) {}
}

export class SetUserGroups implements Action {
  readonly type = SET_USER_GROUP;
  constructor(public payload: any) {}
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
  | SetItem
  | SetLegend
  | SetHeader
  | SetHolders
  | SetHoldersGroups
  | SetAdditionalLabels
  | SetEdditingHeader
  | SetOptions
  | SetUserGroups
  | SetOrgunitSettings
  | SetPeriodType
  | SetSelectedPeriod;
