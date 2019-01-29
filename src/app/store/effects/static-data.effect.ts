import { Injectable } from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
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
  loadFunctions$ = this.actions$.ofType(staticActions.LOAD_FUNCTIONS).pipe(
    tap(() => {
      this.functionService.getAllFunctions();
    })
  );

  @Effect({ dispatch: false })
  loadGroups$ = this.actions$.ofType(staticActions.LOAD_USER_GROUPS).pipe(
    tap(() => {
      this.dataService.getUserGroups();
    })
  );

  @Effect({ dispatch: false })
  loadUsers$ = this.actions$.ofType(staticActions.LOAD_USER).pipe(
    tap(() => {
      this.dataService.getUser();
    })
  );
}
