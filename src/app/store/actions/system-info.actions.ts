import { createAction, props } from '@ngrx/store';

import { ErrorMessage, SystemInfo } from '../../core';

export enum SystemInfoActionTypes {
  LoadSystemInfo = '[SystemInfo] Load System info',
  AddSystemInfo = '[SystemInfo] Add System info',
  LoadSystemInfoFail = '[SystemInfo] Load System info fail'
}

export const loadSystemInfo = createAction('[SystemInfo] Load System info');

export const addSystemInfo = createAction(
  '[SystemInfo] Add System info',
  props<{ systemInfo: SystemInfo }>()
);

export const loadSystemInfoFail = createAction(
  '[SystemInfo] Load System info fail',
  props<{ error: ErrorMessage }>()
);
