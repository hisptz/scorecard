import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { tap, map, filter, take, switchMap } from 'rxjs/operators';

import { ScoreCard } from '../shared/models/scorecard';
import { ApplicationState } from '../store/reducers';
import { getScorecardEntites, getScorecardLoaded } from '../store/selectors/scorecard.selectors';
import { LoadScorecards } from '../store/actions/scorecard.actions';

@Injectable()
export class ScorecardExistsGuards implements CanActivate {
  constructor(private store: Store<ApplicationState>) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.checkStore().pipe(
      switchMap(() => {
        const id = route.params.scorecardid;
        return this.hasScorecard(id);
      })
    );
  }

  hasScorecard(id: string): Observable<boolean> {
    return this.store
      .select(getScorecardEntites)
      .pipe(
        map((entities: { [key: string]: ScoreCard }) => !!entities[id]),
        take(1)
      );
  }

  checkStore(): Observable<boolean> {
    return this.store.select(getScorecardLoaded).pipe(
      tap(loaded => {
        if (!loaded) {
          this.store.dispatch(new LoadScorecards());
        }
      }),
      filter(loaded => loaded),
      take(1)
    );
  }
}
