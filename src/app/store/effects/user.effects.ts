import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/internal/operators';
import { UserService, User } from '../../core';

import { Action } from '@ngrx/store';
import {
  addSystemInfo,
  loadCurrentUser,
  addCurrentUser,
  loadCurrentUserFail
} from '../actions';

@Injectable()
export class UserEffects {
  systemInfoLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addSystemInfo),
      map(({ systemInfo }) => loadCurrentUser({ systemInfo }))
    )
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCurrentUser),
      switchMap(({ systemInfo }) =>
        this.userService.loadCurrentUser().pipe(
          map((currentUser: User) =>
            addCurrentUser({ currentUser, systemInfo })
          ),
          catchError((error: any) => of(loadCurrentUserFail({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
