import {Action} from '@ngrx/store';
import {ProgramIndicatorGroups} from '../../shared/services/program-indicators.service';

export const LOAD_PROGRAM_INDICATOR_GROUP = '[ProgramIndicatorGroup] Load ProgramIndicatorGroup';
export const LOAD_PROGRAM_INDICATOR_GROUP_FAIL = '[ProgramIndicatorGroup] Load ProgramIndicatorGroup Fail';
export const LOAD_PROGRAM_INDICATOR_GROUP_COMPLETE = '[ProgramIndicatorGroup] Load ProgramIndicatorGroup Complete';

export class LoadProgramIndicatorGroup implements Action {
  readonly type = LOAD_PROGRAM_INDICATOR_GROUP;
}

export class LoadProgramIndicatorGroupFail implements Action {
  readonly type = LOAD_PROGRAM_INDICATOR_GROUP_FAIL;
  constructor(public payload: any) {}
}

export class LoadProgramIndicatorGroupSuccess implements Action {
  readonly type = LOAD_PROGRAM_INDICATOR_GROUP_COMPLETE;
  constructor(public payload: ProgramIndicatorGroups[]) {}
}

export type ProgramIndicatorGroupActions = LoadProgramIndicatorGroup| LoadProgramIndicatorGroupFail | LoadProgramIndicatorGroupSuccess;
