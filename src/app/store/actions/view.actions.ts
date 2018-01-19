import { Action } from '@ngrx/store';
import {CreatedScorecardState} from '../reducers/create.reducer';
import {ViewScorecardState} from '../reducers/view.reducer';

export const SET_VIEWED_SCORECARD = '[View] Set Viewed Scorecard';
export const GET_SCORECARD_TO_VIEW = '[View] Get Scorecard to View';
export const SET_SCORECARD_LOADED = '[View] Set Scorecard Loaded';
export const SET_SELECTED_OU = '[View] Set Selected OU';
export const SET_SELECTED_PE = '[View] Set Selected PE';
export const SET_SCORECARD_OPTIONS = '[View] Set Scorecard Options';

export const SET_ITEM = '[View] Set configuration Item';
export const SET_LEGEND = '[View] Set Legend';
export const SET_HEADER = '[View] Set Header';
export const SET_HOLDERS = '[View] Set Holders';
export const SET_HOLDER_GROUPS = '[View] Set Holder Groups';
export const SET_ADDITIONAL_LABELS = '[View] Set Additional Labels';
export const SET_SORTING_COLUMN = '[View] Set Sorting Column';


export class SetViewdScorecard implements Action {
  readonly type = SET_VIEWED_SCORECARD;
  constructor(public payload: ViewScorecardState) {}
}

export class SetItem implements Action {
  readonly type = SET_ITEM;
  constructor(public payload: {key: any, value: any}) {}
}

export class SetLegend implements Action {
  readonly type = SET_LEGEND;
  constructor(public payload: any) {}
}

export class SetSelectedPe implements Action {
  readonly type = SET_SELECTED_PE;
  constructor(public payload: any) {}
}

export class SetSelectedOu implements Action {
  readonly type = SET_SELECTED_OU;
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

export class SetLoaded implements Action {
  readonly type = SET_SCORECARD_LOADED;
  constructor(public payload: boolean) {}
}

export class SetOptions implements Action {
  readonly type = SET_SCORECARD_OPTIONS;
  constructor(public payload: any) {}
}

export class SetSortingColumn implements Action {
  readonly type = SET_SORTING_COLUMN;
  constructor(public payload: any) {}
}


export class GetScorecardToView implements Action {
  readonly type = GET_SCORECARD_TO_VIEW;
}


export type Actions =
  SetViewdScorecard
  | GetScorecardToView
  | SetItem
  | SetLegend
  | SetHeader
  | SetHolders
  | SetHoldersGroups
  | SetAdditionalLabels
  | SetLoaded
  | SetSelectedOu
  | SetSelectedPe
  | SetOptions
  | SetSortingColumn;
