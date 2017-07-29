/**
 * Created by kelvin on 7/29/17.
 */
import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';

@Injectable()
export class DataStoreEffect {

  constructor( private actions$: Actions ) {

  }

  // @Effect() emptyAnalytics$: Observable<Action> = this.actions$
  //   .ofType(ADD_EMPTY_ANALYITICS)
  //   .switchMap(action => this.analyticsService.prepareAnalytics(action.payload))
  //   .map(items => new AddEmptyAnalyticsDoneAction(items) );
  //
  // @Effect() analyticsWithData$: Observable<Action> = this.actions$
  //   .ofType(ADD_DATA_ANALYITICS)
  //   .switchMap(action => this.analyticsService.prepareEmptyAnalytics(action.payload))
  //   .map(items => new AddDataAnalyticsDoneAction(items) );

}
