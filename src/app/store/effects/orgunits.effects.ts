import { Injectable } from '@angular/core';
import * as orgunitAction from '../actions/orgunits.actions';

import { Effect, Actions } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { OrgUnitService } from '../../shared/services/org-unit.service';

@Injectable()
export class OrgunitsEffects {

  constructor(
    private actions$: Actions,
    private orgUnitService: OrgUnitService,
  ) {  }

  @Effect({ dispatch: false })
  loadScorecard$ = this.actions$.ofType(orgunitAction.LOAD_ORGANASATION_UNIT_ITEMS).pipe(
    tap(() => {
      this.orgUnitService.prepareOrgunits('report');
    })
  );

}
