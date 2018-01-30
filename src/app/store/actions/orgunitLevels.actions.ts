import {Action} from '@ngrx/store';
import {OrganisationUnitLevel} from '../../shared/models/organisationUnitLevel';

export const LOAD_ORGANISATION_UNIT_LEVELS = '[OrgUnitLevels] Load OrgUnitLevels';
export const LOAD_ORGANISATION_UNIT_LEVELS_FAIL = '[OrgUnitLevels] Load OrgUnitLevels Fail';
export const LOAD_ORGANISATION_UNIT_LEVELS_COMPLETE = '[OrgUnitLevels] Load OrgUnitLevels Complete';

export class LoadOrgUnitLevels implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_LEVELS;
}

export class LoadOrgUnitLevelsFail implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_LEVELS_FAIL;
  constructor(public payload: any) {}
}

export class LoadOrgUnitLevelsSuccess implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_LEVELS_COMPLETE;
  constructor(public payload: OrganisationUnitLevel[]) {}
}

export type OrgUnitLevelsActions = LoadOrgUnitLevels| LoadOrgUnitLevelsFail | LoadOrgUnitLevelsSuccess;
