import { Action } from '@ngrx/store';

export const LOAD_ORGANASATION_UNIT_ITEMS = '[Organisation Unit] Load Organisation Unit Items';
export const DONE_LOADING_ORGANASATION_UNIT_ITEMS = '[Organisation Unit] Done Loading Organisation Unit Items';


export class LoadOrganisationUnitItem implements Action {
  readonly type = LOAD_ORGANASATION_UNIT_ITEMS;
}

export class DoneLoadingOrganisationUnitItem implements Action {
  readonly type = DONE_LOADING_ORGANASATION_UNIT_ITEMS;
  constructor(public payload: {key: any, value: any}) {}
}

export type OrgunitsActions = LoadOrganisationUnitItem | DoneLoadingOrganisationUnitItem;
