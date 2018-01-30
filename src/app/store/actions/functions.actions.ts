import {Action} from '@ngrx/store';
import {FunctionObject } from '../../shared/models/function-object';

export const LOAD_FUNCTIONS = '[Functions] Load Functions';
export const LOAD_FUNCTIONS_FAIL = '[Functions] Load Functions Fail';
export const LOAD_FUNCTIONS_COMPLETE = '[Functions] Load Functions Complete';

export class LoadFunctions implements Action {
  readonly type = LOAD_FUNCTIONS;
}

export class LoadFunctionsFail implements Action {
  readonly type = LOAD_FUNCTIONS_FAIL;
  constructor(public payload: any) {}
}

export class LoadFunctionsSuccess implements Action {
  readonly type = LOAD_FUNCTIONS_COMPLETE;
  constructor(public payload: FunctionObject[]) {}
}

export type FunctionsActions = LoadFunctions | LoadFunctionsFail | LoadFunctionsSuccess;
