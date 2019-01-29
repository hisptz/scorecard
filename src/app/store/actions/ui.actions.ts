import { Action } from '@ngrx/store';

export const SET_VIEW_TITLE = '[UI] Set view title';
export const SET_HOME_LOADING_PERCENT = '[UI] Set Home Loading Percent';
export const SET_VIEW_STYLE = '[UI] Set View Style';


export class SetViewTitle implements Action {
  readonly type = SET_VIEW_TITLE;
  constructor(public payload: string) {}
}

export class SetHomeLoadingPercent implements Action {
  readonly type = SET_HOME_LOADING_PERCENT;
  constructor(public payload: number) {}
}


export class SetViewStyle implements Action {
  readonly type = SET_VIEW_STYLE;
  constructor(public payload: string) {}
}

export type UiActions =
  SetViewTitle
  | SetHomeLoadingPercent
  | SetViewStyle;
