import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import {LOAD_USER_GROUP, LoadUserGroupsFail, LoadUserGroupsSuccess} from '../actions/userGroups.actions';
import {DataService} from '../../shared/services/data.service';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {LOAD_FUNCTIONS, LoadFunctionsFail, LoadFunctionsSuccess} from '../actions/functions.actions';
import {FunctionService} from '../../shared/services/function.service';
import {
  LOAD_ORGANISATION_UNIT_GROUPS, LoadOrgUnitGroupsFail,
  LoadOrgUnitGroupsSuccess
} from '../actions/orgUnitGroup.actions';
import {OrgUnitService} from '../../shared/services/org-unit.service';
import {
  LOAD_ORGANISATION_UNIT_LEVELS, LoadOrgUnitLevelsFail,
  LoadOrgUnitLevelsSuccess
} from '../actions/orgunitLevels.actions';
import {LOAD_ORGANISATION_UNIT, LoadOrgUnitsFail, LoadOrgUnitsSuccess} from '../actions/orgUnit.actions';
import {DataElementGroupService} from '../../shared/services/data-element-group.service';
import {IndicatorGroupService} from '../../shared/services/indicator-group.service';
import {DatasetService} from '../../shared/services/dataset.service';
import {EventDataService} from '../../shared/services/event-data.service';
import {ProgramIndicatorsService} from '../../shared/services/program-indicators.service';
import {
  LOAD_INDICATOR_GROUP, LoadIndicatorGroups, LoadIndicatorGroupsFail,
  LoadIndicatorGroupsSuccess
} from '../actions/indicatorGroup.actions';
import {LOAD_DATASET, LoadDatasetsFail, LoadDatasetsSuccess} from '../actions/datasets.actions';
import {
  LOAD_DATA_ELEMENT_GROUP, LoadDataElementGroupsFail,
  LoadDataElementGroupsSuccess
} from '../actions/dataelement.actions';
import {
  LOAD_PROGRAM_INDICATOR_GROUP, LoadProgramIndicatorGroupFail,
  LoadProgramIndicatorGroupSuccess
} from '../actions/programIndicator.actions';
import {LOAD_EVENT_GROUP, LoadEventGroupsFail, LoadEventGroupsSuccess} from '../actions/events.actions';

@Injectable()
export class MetadataEffects {
  constructor(
    private actions$: Actions,
    private dataService: DataService,
    private functionService: FunctionService,
    private orgunitService: OrgUnitService,
    private dataelementService: DataElementGroupService,
    private indicatorService: IndicatorGroupService,
    private datasetService: DatasetService,
    private eventService: EventDataService,
    private programService: ProgramIndicatorsService
  ) {}

  @Effect()
  loadUserGroups$ = this.actions$.ofType(LOAD_USER_GROUP).pipe(
    switchMap( () => {
      return this.dataService.getUserGroupInformation().pipe(
        map((userGroups) => new LoadUserGroupsSuccess(userGroups)),
        catchError( error => of(new LoadUserGroupsFail(error)))
      );
    })
  );

  @Effect()
  loadFunctions$ = this.actions$.ofType(LOAD_FUNCTIONS).pipe(
    switchMap( () => {
      return this.functionService.getAll().pipe(
        map((functions) => new LoadFunctionsSuccess(functions)),
        catchError( error => of(new LoadFunctionsFail(error)))
      );
    })
  );

  @Effect()
  loadOrganisationGroups$ = this.actions$.ofType(LOAD_ORGANISATION_UNIT_GROUPS).pipe(
    switchMap( () => {
      return this.orgunitService.getOrgunitGroups().pipe(
        map((data) => new LoadOrgUnitGroupsSuccess(data)),
        catchError( error => of(new LoadOrgUnitGroupsFail(error)))
      );
    })
  );

  @Effect()
  loadOrganisationUnits$ = this.actions$.ofType(LOAD_ORGANISATION_UNIT).pipe(
    switchMap( () => {
      return this.orgunitService.getOrgunits().pipe(
        map((data) => new LoadOrgUnitsSuccess(data)),
        catchError( error => of(new LoadOrgUnitsFail(error)))
      );
    })
  );

  @Effect()
  loadOrganisationLevels$ = this.actions$.ofType(LOAD_ORGANISATION_UNIT_LEVELS).pipe(
    switchMap( () => {
      return this.orgunitService.getOrgunitLevelsInformation().pipe(
        map((data) => new LoadOrgUnitLevelsSuccess(data)),
        catchError( error => of(new LoadOrgUnitLevelsFail(error)))
      );
    })
  );

  @Effect()
  loadIndicatorGroups$ = this.actions$.ofType(LOAD_INDICATOR_GROUP).pipe(
    switchMap( () => {
      return this.indicatorService.loadAll().pipe(
        map((data) => new LoadIndicatorGroupsSuccess(data)),
        catchError( error => of(new LoadIndicatorGroupsFail(error)))
      );
    })
  );

  @Effect()
  loadDatasets$ = this.actions$.ofType(LOAD_DATASET).pipe(
    switchMap( () => {
      return this.datasetService.loadAll().pipe(
        map((data) => new LoadDatasetsSuccess(data)),
        catchError( error => of(new LoadDatasetsFail(error)))
      );
    })
  );

  @Effect()
  loadDataElementGroups$ = this.actions$.ofType(LOAD_DATA_ELEMENT_GROUP).pipe(
    switchMap( () => {
      return this.dataelementService.loadAll().pipe(
        map((data) => new LoadDataElementGroupsSuccess(data)),
        catchError( error => of(new LoadDataElementGroupsFail(error)))
      );
    })
  );

  @Effect()
  loadProgramIndicatorGroups$ = this.actions$.ofType(LOAD_PROGRAM_INDICATOR_GROUP).pipe(
    switchMap( () => {
      return this.programService.loadAll().pipe(
        map((data) => new LoadProgramIndicatorGroupSuccess(data)),
        catchError( error => of(new LoadProgramIndicatorGroupFail(error)))
      );
    })
  );

  @Effect()
  loadEventData$ = this.actions$.ofType(LOAD_EVENT_GROUP).pipe(
    switchMap( () => {
      return this.eventService.getAll().pipe(
        map((data) => new LoadEventGroupsSuccess(data)),
        catchError( error => of(new LoadEventGroupsFail(error)))
      );
    })
  );





}
