import { Action } from '@ngrx/store';

export const LOAD_ORGANASATION_UNIT_ITEMS = '[Organisation Unit] Load Organisation Unit Items';
export const DONE_LOADING_ORGANASATION_UNIT_ITEMS = '[Organisation Unit] Done Loading Organisation Unit Items';
export const DONE_LOADING_ORGANASATION_UNITS = '[Organisation Unit] Done Loading Organisation Units';
export const DONE_LOADING_ORGANASATION_UNIT_GROUPS = '[Organisation Unit] Done Loading Organisation Unit Groups';
export const DONE_LOADING_ORGANASATION_UNIT_LEVELS = '[Organisation Unit] Done Loading Organisation Unit Levels';
export const DONE_LOADING_USER_ORGANASATION_UNITS = '[Organisation Unit] Done Loading User Organisation Unit';


export class LoadOrganisationUnitItem implements Action {
  readonly type = LOAD_ORGANASATION_UNIT_ITEMS;
}

export class DoneLoadingOrganisationUnitItem implements Action {
  readonly type = DONE_LOADING_ORGANASATION_UNIT_ITEMS;
}

export class DoneLoadingOrganisationUnits implements Action {
  readonly type = DONE_LOADING_ORGANASATION_UNITS;
  constructor(public payload: any) {}
}

export class DoneLoadingOrganisationUnitGroups implements Action {
  readonly type = DONE_LOADING_ORGANASATION_UNIT_GROUPS;
  constructor(public payload: any) {}
}

export class DoneLoadingOrganisationUnitLevels implements Action {
  readonly type = DONE_LOADING_ORGANASATION_UNIT_LEVELS;
  constructor(public payload: any) {}
}

export class DoneLoadingUserOrganisationUnits implements Action {
  readonly type = DONE_LOADING_USER_ORGANASATION_UNITS;
  constructor(public payload: any) {}
}

export type OrgunitsActions =
  LoadOrganisationUnitItem
  | DoneLoadingOrganisationUnitItem
  | DoneLoadingOrganisationUnitGroups
  | DoneLoadingOrganisationUnitLevels
  | DoneLoadingOrganisationUnits
  | DoneLoadingUserOrganisationUnits;
