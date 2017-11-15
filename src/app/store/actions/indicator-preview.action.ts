import {Action} from '@ngrx/store';
/**
 * Created by kelvin on 11/5/17.
 */
export const SET_OU_MODEL_ACTION = 'SET_OU_MODEL_ACTION';
export const SET_SELECTED_OU_ACTION = 'SET_SELECTED_OU_ACTION';
export const SET_SELECTED_PERIOD_ACTION = 'SET_SELECTED_PERIOD_ACTION';
export const SET_PERIOD_TYPE_ACTION = 'SET_PERIOD_TYPE_ACTION';
export const SET_YEAR_ACTION = 'SET_YEAR_ACTION';
export const SET_ANALYTICS_ACTION = 'SET_ANALYTICS_ACTION';
export const SET_TABLE_OBJECT_ACTION = 'SET_TABLE_OBJECT_ACTION';
export const SET_CHART_OBJECT_ACTION = 'SET_CHART_OBJECT_ACTION';
export const SET_MAP_OBJECT_ACTION = 'SET_MAP_OBJECT_ACTION';
export const SET_LOADING_ACTION = 'SET_LOADING_ACTION';
export const SHOW_MODEL = 'SHOW_MODEL';

export class SetOUModelAction implements Action {
  type = SET_OU_MODEL_ACTION;
  constructor ( public payload: any ) {}
}

export class SetSelectedOUAction implements Action {
  type = SET_SELECTED_OU_ACTION;
  constructor ( public payload: any ) {}
}

export class SetSelectedPeriodAction implements Action {
  type = SET_SELECTED_PERIOD_ACTION;
  constructor ( public payload: any ) {}
}

export class SetPeriTypeAction implements Action {
  type = SET_PERIOD_TYPE_ACTION;
  constructor ( public payload: any ) {}
}

export class SetYearAction implements Action {
  type = SET_YEAR_ACTION;
  constructor ( public payload: any ) {}
}

export class SetAnalyticsAction implements Action {
  type = SET_ANALYTICS_ACTION;
  constructor ( public payload: any ) {}
}

export class SetTableObjectAction implements Action {
  type = SET_TABLE_OBJECT_ACTION;
  constructor ( public payload: any ) {}
}

export class SetChartObjectAction implements Action {
  type = SET_CHART_OBJECT_ACTION;
  constructor ( public payload: any ) {}
}

export class SetMapObjectAction implements Action {
  type = SET_MAP_OBJECT_ACTION;
  constructor ( public payload: any ) {}
}

export class SetLoadingAction implements Action {
  type = SET_LOADING_ACTION;
  constructor ( public payload: boolean ) {}
}

export class SetShowModelAction implements Action {
  type = SHOW_MODEL;
  constructor ( public payload: boolean ) {}
}
