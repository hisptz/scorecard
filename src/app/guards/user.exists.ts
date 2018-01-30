import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { tap, map, filter, take, switchMap } from 'rxjs/operators';

import { ApplicationState } from '../store/reducers';
import { getUser, getUserLoaded } from '../store/selectors/user.selectors';
import { LoadUser } from '../store/actions/user.actions';

@Injectable()
export class UserExistsGuards implements CanActivate {
  constructor(private store: Store<ApplicationState>) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.checkStore().pipe(
      switchMap(() => {
        return this.hasUser();
      })
    );
  }

  hasUser(): Observable<boolean> {
    return this.store
      .select(getUser)
      .pipe(
        map((entities) => {
          return !!entities;
        }),
        take(1)
      );
  }

  checkStore(): Observable<boolean> {
    return this.store.select(getUserLoaded).pipe(
      tap(loaded => {
        if (!loaded) {
          this.store.dispatch(new LoadUser());
        }
      }),
      filter(loaded => loaded),
      take(1)
    );
  }
}
