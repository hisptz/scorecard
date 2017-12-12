import { Injectable } from '@angular/core';
import * as scorecardActions from '../actions/scorecard.actions';

import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import {map, switchMap, catchError, tap} from 'rxjs/operators';
import {ScorecardService} from '../../shared/services/scorecard.service';

@Injectable()
export class ScorecardEffects {

  constructor(
    private actions$: Actions,
    private scorecardService: ScorecardService
  ) {  }

  @Effect({ dispatch: false })
  navigate$ = this.actions$.ofType(scorecardActions.LOAD_SCORECARDS).pipe(
    tap(() => {
      this.scorecardService.getAllScoreCards();
    })
  );
}
