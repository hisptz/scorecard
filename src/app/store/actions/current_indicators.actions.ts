import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import {IndicatorObject} from '../../shared/models/indicator-object';

export const LOAD_CURRENT_INDICATOR_SUCCESS = '[Current Indicator] Load Current Indicator Success';
export const UPDATE_CURRENT_INDICATOR_SUCCESS = '[Current Indicator] Update Current Indicator Success';
export const REMOVE_CURRENT_INDICATOR_SUCCESS = '[Current Indicator] Remove Current Indicator Success';

export class LoadCurrentIndicatorSuccess implements Action {
  readonly type = LOAD_CURRENT_INDICATOR_SUCCESS;
  constructor(public payload: IndicatorObject) {}
}

export class UpdateCurrentIndicatorSuccess implements Action {
  readonly type = UPDATE_CURRENT_INDICATOR_SUCCESS;
  constructor(public payload: Update<IndicatorObject>) {}
}

export class RemoveCurrentIndicatorSuccess implements Action {
  readonly type = REMOVE_CURRENT_INDICATOR_SUCCESS;
  constructor(public payload: string) {}
}

export type Actions =
  LoadCurrentIndicatorSuccess
  | UpdateCurrentIndicatorSuccess
  | RemoveCurrentIndicatorSuccess;
