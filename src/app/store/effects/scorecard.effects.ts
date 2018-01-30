import { Injectable } from '@angular/core';
import * as scorecardActions from '../actions/scorecard.actions';

import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import {map, switchMap, catchError, tap} from 'rxjs/operators';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {ApplicationState} from '../reducers/index';
import {Store} from '@ngrx/store';
import {LoadUserGroups} from '../actions/userGroups.actions';
import {LoadFunctions} from '../actions/functions.actions';
import {LoadOrgUnitGroups} from '../actions/orgUnitGroup.actions';
import {LoadOrgUnitLevels} from '../actions/orgunitLevels.actions';
import {LoadOrgUnits} from '../actions/orgUnit.actions';
import {LoadDatasets} from '../actions/datasets.actions';
import {LoadDataElementGroups} from '../actions/dataelement.actions';
import {LoadIndicatorGroups} from '../actions/indicatorGroup.actions';
import {LoadProgramIndicatorGroup} from '../actions/programIndicator.actions';
import {LoadEventGroups} from '../actions/events.actions';
// import {FunctionService} from '../../shared/services/function.service';
// import {DataService} from '../../shared/services/data.service';
// import {OrgUnitService} from '../../shared/services/org-unit.service';
// import {GET_SCORECARD_TO_VIEW} from '../actions/view.actions';

@Injectable()
export class ScorecardEffects {

  constructor(
    private actions$: Actions,
    private scorecardService: ScorecardService,
    private store: Store<ApplicationState>
    // private dataService: DataService,
    // private orgUnitService: OrgUnitService,
    // private functionService: FunctionService
  ) {  }

  @Effect({ dispatch: false })
  loadScorecard$ = this.actions$.ofType(scorecardActions.LOAD_SCORECARDS).pipe(
    tap(() => {
      this.scorecardService.getAllScoreCards();
    })
  );

  // @Effect({ dispatch: false })
  // loadScorecardToView$ = this.actions$.ofType(GET_SCORECARD_TO_VIEW).pipe(
  //   tap(() => {
  //     this.scorecardService.getViewedScorecard();
  //   })
  // );


  @Effect({ dispatch: false })
  LoadMetadata$ = this.actions$.ofType(scorecardActions.LOAD_SCORECARDS_COMPLETE).pipe(
    tap(() => {
      this.store.dispatch(new LoadUserGroups());
      this.store.dispatch(new LoadFunctions());
      this.store.dispatch(new LoadOrgUnits());
      this.store.dispatch(new LoadOrgUnitGroups());
      this.store.dispatch(new LoadOrgUnitLevels());
      this.store.dispatch(new LoadDatasets());
      this.store.dispatch(new LoadDataElementGroups());
      this.store.dispatch(new LoadIndicatorGroups());
      this.store.dispatch(new LoadProgramIndicatorGroup());
      this.store.dispatch(new LoadEventGroups());
    })
  );
}
