import {Action} from '@ngrx/store';
import {OrganisationUnit} from '../../shared/models/organisationUnit';

export const LOAD_ORGANISATION_UNIT = '[OrgUnits] Load OrgUnits';
export const LOAD_ORGANISATION_UNIT_FAIL = '[OrgUnits] Load OrgUnits Fail';
export const LOAD_ORGANISATION_UNIT_COMPLETE = '[OrgUnits] Load OrgUnits Complete';

export class LoadOrgUnits implements Action {
  readonly type = LOAD_ORGANISATION_UNIT;
}

export class LoadOrgUnitsFail implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_FAIL;
  constructor(public payload: any) {}
}

export class LoadOrgUnitsSuccess implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_COMPLETE;
  constructor(public payload: OrganisationUnit[]) {}
}

export type OrgUnitsActions = LoadOrgUnits| LoadOrgUnitsFail | LoadOrgUnitsSuccess;
