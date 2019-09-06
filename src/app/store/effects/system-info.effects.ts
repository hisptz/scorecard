import { Injectable } from '@angular/core';
import { SystemInfoService } from '@iapps/ngx-dhis2-http-client';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { defer, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { getSanitizedSystemInfo } from '../../core';
import { addSystemInfo, loadSystemInfo, loadSystemInfoFail } from '../actions';

@Injectable()
export class SystemInfoEffects {
  constructor(
    private actions$: Actions,
    private systemInfoService: SystemInfoService
  ) {}

  loadSystemInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSystemInfo),
      switchMap(() =>
        this.systemInfoService.getSystemInfo().pipe(
          map((systemInfoResponse: any) =>
            addSystemInfo({
              systemInfo: getSanitizedSystemInfo(systemInfoResponse)
            })
          ),
          catchError((error: any) => of(loadSystemInfoFail({ error })))
        )
      )
    )
  );

  init$ = createEffect(() => defer(() => of(loadSystemInfo())));
}
