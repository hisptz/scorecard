import {Action} from '@ngrx/store';
import {OrganisationUnitGroup} from '../../shared/models/organisationUnitGroup';

export const LOAD_ORGANISATION_UNIT_GROUPS = '[OrgUnitGroups] Load OrgUnitGroups';
export const LOAD_ORGANISATION_UNIT_GROUPS_FAIL = '[OrgUnitGroups] Load OrgUnitGroups Fail';
export const LOAD_ORGANISATION_UNIT_GROUPS_COMPLETE = '[OrgUnitGroups] Load OrgUnitGroups Complete';

export class LoadOrgUnitGroups implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_GROUPS;
}

export class LoadOrgUnitGroupsFail implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_GROUPS_FAIL;
  constructor(public payload: any) {}
}

export class LoadOrgUnitGroupsSuccess implements Action {
  readonly type = LOAD_ORGANISATION_UNIT_GROUPS_COMPLETE;
  constructor(public payload: OrganisationUnitGroup[]) {}
}

export type OrgUnitGroupsActions = LoadOrgUnitGroups| LoadOrgUnitGroupsFail | LoadOrgUnitGroupsSuccess;
