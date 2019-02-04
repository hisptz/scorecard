import { Injectable } from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {DataService} from '../../shared/services/data.service';
import {FunctionService} from '../../shared/services/function.service';
import * as staticActions from '../actions/static-data.actions';
import {tap} from 'rxjs/operators';

@Injectable()
export class StaticDataEffect {
  constructor(
    private actions$: Actions,
    private dataService: DataService,
    private functionService: FunctionService
  ) {  }

  @Effect({ dispatch: false })
  loadFunctions$ = this.actions$.pipe(
    ofType(staticActions.LOAD_FUNCTIONS),
    tap(() => {
      this.functionService.getAllFunctions();
    })
  );

  @Effect({ dispatch: false })
  loadGroups$ = this.actions$.pipe(
    ofType(staticActions.LOAD_USER_GROUPS),
    tap(() => {
      this.dataService.getUserGroups();
    })
  );

  @Effect({ dispatch: false })
  loadUsers$ = this.actions$.pipe(
    ofType(staticActions.LOAD_USER),
    tap(() => {
      this.dataService.getUser();
    })
  );
}
