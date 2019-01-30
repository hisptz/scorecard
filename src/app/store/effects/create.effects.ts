import { Injectable } from '@angular/core';

import { Effect, Actions, ofType } from '@ngrx/effects';
import * as createActions from '../actions/create.actions';

import { of } from 'rxjs/observable/of';
import {map, switchMap, catchError, tap} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {ApplicationState} from '../reducers';
import {ScorecardService} from '../../shared/services/scorecard.service';

@Injectable()
export class CreateEffects {

  constructor(
    private actions$: Actions,
    private scorecardService: ScorecardService
  ) {  }

  @Effect({ dispatch: false })
  navigate$ = this.actions$.pipe(
    ofType(createActions.GET_SCORECARD_TO_CREATE),
    tap(() => {
      this.scorecardService.getCreatedScorecard();
    })
  );
}
